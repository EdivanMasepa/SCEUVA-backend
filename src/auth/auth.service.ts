import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ){}

  async validateLoginUser(login: string, password: string){
    const user = await this.userService.findByIdentifier(login);
    if(!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if(!match) return null;

    const {password: _p, ...rest } = user as any; 
    return rest;
  }

  async getTokens(payload: {sub: number; login: string}){
    
    const acessToken = await this.jwtService.signAsync(
      {sub: payload.sub, login: payload.login},
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN')
      }
    )
    
    const refreshToken = await this.jwtService.signAsync(
      {sub: payload.sub, login: payload.login},
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }
    )
    return {acessToken, refreshToken};
  }

  async login(user: any){
    const tokens = await this.getTokens({sub: user.id, login: user.login});
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);

    await this.userService.setRefreshToken(hashedRefresh, user.id);

    return tokens;
  }

  async refreshTokens(userId: number, refreshToken: string){
    const user = await this.userService.findByIdentifier(userId);
    if(!user || !user.hashedRefreshToken) throw new ForbiddenException("Acesso não autorizado.");
    
    const isMatch = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if(!isMatch) throw new ForbiddenException("Acesso não autorizado.");

    const tokens = await this.getTokens({sub: user.id, login: user.email});
    const hashed = await bcrypt.hash(tokens.refreshToken, 10);

    await this.userService.setRefreshToken(hashed, user.id);

    return tokens;
  }

  async logout(userId: number){
    await this.userService.removeRefreshToken(userId);
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
