import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PersonEntity } from './entities/person.entity';
import { InstituitionEntity } from './entities/instituition.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserTypeEnum } from 'src/shared/enums/user-type.enums';
import { ListUserDTO } from './dto/list-user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PersonEntity) private readonly userPersonRepository: Repository<PersonEntity>,
    @InjectRepository(InstituitionEntity) private readonly userInstituitionRepository: Repository<InstituitionEntity>
  ){}
  
  async create(createUser: CreateUserDTO) {
    try {
      if(await this.findByIdentifier(createUser.phone))
        throw new BadRequestException('Número de telefone já cadastrado.');
      
      if(createUser.email && await this.findByIdentifier(createUser.email))
        throw new BadRequestException('E-mail já cadastrado.');

      if(createUser.password != createUser.confirmPassword)
        throw new BadRequestException('As senhas não conferem.');
       
      const senhaHasheada: string = await bcrypt.hash(createUser.password, 10);
    
      const userEntity:UserEntity = new UserEntity();
      userEntity.userType = createUser.userType,
      userEntity.name = createUser.name;
      userEntity.email = createUser.email;
      userEntity.phone = createUser.phone;
      userEntity.password = senhaHasheada;

      const createdUser: UserEntity = await this.userRepository.save(userEntity);

      if(createUser.userType === UserTypeEnum.PERSON && createUser.person != null){
        if(!this.validateCPF(createUser.person.cpf))
           throw new BadRequestException('CPF inválido.');

        if(await this.findByIdentifier(createUser.person.cpf))
          throw new BadRequestException('CPF já cadastrado.');

        const personEntity: PersonEntity = new PersonEntity();

        personEntity.cpf = createUser.person.cpf;
        personEntity.birthDate = createUser.person.birthDate;
        personEntity.gender = createUser.person.gender;
        personEntity.riskLevel = createUser.person.riskLevel;

        const createdUser: UserEntity = await this.userRepository.save(userEntity);
        personEntity.user = createdUser;

        const createdPerson = await this.userPersonRepository.save(personEntity);           
        createdUser.person = createdPerson;

        await this.userRepository.save(createdUser);              
      }

      else if(createUser.userType === UserTypeEnum.INSTITUITION && createUser.instituition != null){
        if(!this.validateCNPJ(createUser.instituition.cnpj))
          throw new BadRequestException('CNPJ inválido.');

        if(await this.findByIdentifier(createUser.instituition.cnpj))
          throw new BadRequestException('CNPJ já cadastrado.');

        const instituitionEntity:InstituitionEntity = new InstituitionEntity();

        instituitionEntity.cnpj = createUser.instituition.cnpj;
        instituitionEntity.foundationDate = createUser.instituition.foundationDate;
        if(createUser.instituition.segment)
          instituitionEntity.segment = createUser.instituition.segment;

        const createdUser: UserEntity = await this.userRepository.save(userEntity);
        instituitionEntity.user = createdUser;
        
        const createdInstituition = await this.userInstituitionRepository.save(instituitionEntity);           
        createdUser.instituition = createdInstituition;

        await this.userRepository.save(createdUser);
      }
      else{
        throw new BadRequestException('Tipo de usuário inválido.');
      }

      return{statusCode: 201, message: 'Usuário cadastrado com sucesso.'};

    } catch (erro) {
      if(erro instanceof BadRequestException)
        throw erro;
      
      throw new InternalServerErrorException('Erro interno. Verifique os dados e tente novamente.')
    }
  }

  async findByIdentifier(parameter: any): Promise<UserEntity | null>{
    if(typeof parameter === 'number'){
      let user = await this.userRepository.findOneBy({id: parameter})
      if(user) return user;

    } else if (typeof parameter === 'string'){
      let user = await this.userRepository.findOne({where: {email: parameter}})
      if(user) return user;

      user = await this.userRepository.findOne({where: {phone: parameter}})
      if(user) return user;

      let userPerson = await this.userPersonRepository.findOne({where: {cpf: parameter}})
      if(userPerson) 
        user = await this.userRepository.findOneBy({id: userPerson.user.id})
    
      let userIsntituitionRepository = await this.userInstituitionRepository.findOne({where: {cnpj: parameter}})
      if(userIsntituitionRepository) 
        user = await this.userRepository.findOneBy({id: userIsntituitionRepository.user.id})
      
      if(user) return user;
    }
    
    return null;
  }

  async setRefreshToken(hashedToken: string, userId: number){
    try{
      await this.userRepository.update(userId, {hashedRefreshToken: hashedToken})
    }catch(erro){
      throw new InternalServerErrorException('Erro interno ao atualizar o token de autenticação.')
    }
  }

  async removeRefreshToken(userId: number){
    try{
      await this.userRepository.update(userId, {hashedRefreshToken: null})
    }catch(erro){
      throw new InternalServerErrorException('Erro interno ao atualizar o token de autenticação.')
    }
  }

  async findAll(filter?: { userType?: UserTypeEnum, moderator?: boolean, name?: string}, pagination?: {page?: number, limit?: number}): Promise<[ListUserDTO[], number]> {
    try {
      const page = pagination?.page && pagination?.page > 0 ? pagination?.page : 1;
      const limit = pagination?.limit ?? 10;

      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.person', 'person')
        .leftJoinAndSelect('user.instituition', 'instituition')
        .select([
          'user.id', 'user.userType',  'user.name', 'user.email', 'user.phone', 'user.moderator',
          'person.birthDate', 'person.gender', 'person.riskLevel',
          'instituition.cnpj', 'instituition.foundationDate', 'instituition.segment'
        ])
        .skip((page - 1 ) * limit )
        .take(limit)
        .orderBy('user.name', 'ASC')

      if(filter?.userType != null)
        queryBuilder.andWhere('user.userType = :userType', {userType: filter?.userType});

      if(typeof filter?.moderator === 'boolean')
        queryBuilder.andWhere('user.moderator = :moderator', {moderator: filter?.moderator});

      if(filter?.name?.trim())
        queryBuilder.andWhere("user.name ilike :name", {name: `%${filter?.name}%`});

      const [users, count] = await queryBuilder.getManyAndCount();
      
      const dtos = users.map(user => 
        plainToInstance(ListUserDTO, user, {excludeExtraneousValues: true})
      )

      return [dtos, count];

    } catch (erro) {

      console.log(erro);
      
      throw new InternalServerErrorException('Erro interno. Verifique os dados e tente novamente.')
    }
  }

  update(id: number, updateUserDto: UpdateUserDTO) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  validateCPF(cpf: string){
    cpf = cpf.replace(/\D/g, '');
    if(cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let cpfList = cpf.split('');
    let cpfToNumber: number[] = [];
    let cpfVerify: number[] = [];
    let sum: number = 0;
    let checkDigit: number;
    let firstListToSum = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    let secondListToSum = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

    for(let i = 0; i < cpfList.length; i++){
      cpfVerify[i] = parseInt(cpfList[i]);
    }
    
    for(let i = 0; i < (cpfList.length - 2); i++){
      cpfToNumber[i] = parseInt(cpfList[i]);
      sum += firstListToSum[i] * cpfToNumber[i];
    }

    checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    cpfToNumber.push(checkDigit);
    sum = 0;

    for(let i = 0; i < (cpfList.length - 1); i++){
      sum += secondListToSum[i] * cpfToNumber[i];
    }

    checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    cpfToNumber.push(checkDigit);
    
    for(let i = 0; i < cpf.length; i++){  
      if(cpfToNumber[i] !== cpfVerify[i]) return false;
    }

    return true;
  }

  validateCNPJ(cnpj: string){
    cnpj = cnpj.replace(/\D/g, '');
    if(cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    let cnpjLista = cnpj.split('');
    let cnpjToNumber: number[] = [];
    let cnpjVerify: number[] = [];  
    let sum: number = 0;
    let checkDigit:number;
    let firstListToSum = [ 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let secondListToSum = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    for(let i = 0; i < cnpjLista.length; i++){
      cnpjVerify[i] = parseInt(cnpjLista[i]);
    }

    for(let i = 0; i < (cnpjLista.length - 2); i++){
      cnpjToNumber[i] = parseInt(cnpjLista[i]);
      sum += firstListToSum[i] * cnpjToNumber[i];
    }    

    checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    cnpjToNumber.push(checkDigit)
    sum = 0;

    for(let i = 0; i < (cnpjLista.length - 1); i++){
      sum += secondListToSum[i] * cnpjToNumber[i];
    }   

    checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    cnpjToNumber.push(checkDigit)

    for(let i = 0; i < cnpjToNumber.length; i++){
      if(cnpjToNumber[i] != cnpjVerify[i]) return false
    }

    return true
  }
}
