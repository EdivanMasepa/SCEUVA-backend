import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        configService: ConfigService,
        private readonly userService: UserService,
    ){
        const secret =  configService.get<string>('JWT_SECRET');
        
        if(!secret)
            throw new Error('Não foi possível encontrar o token.');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret
        });
    }

    async validate(payload: any) {
        const user = await this.userService.findByIdentifier(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado.');
        }

        return { id: payload.sub, username: payload.login };
  }
}