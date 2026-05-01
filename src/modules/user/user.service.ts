import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PersonEntity } from './entities/person.entity';
import { InstituitionEntity } from './entities/instituition.entity';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ListUserDTO } from './dto/list-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserTypeEnum } from '../../shared/enums/user-type.enums';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PersonEntity) private readonly userPersonRepository: Repository<PersonEntity>,
    @InjectRepository(InstituitionEntity) private readonly userInstituitionRepository: Repository<InstituitionEntity>,
    private readonly dataSource: DataSource
  ){}
  
  async create(createUser: CreateUserDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(createUser.password != createUser.confirmPassword)
        throw new BadRequestException('As senhas não conferem.');

      const senhaHasheada: string = await bcrypt.hash(createUser.password, 10);

      // checar duplicados usando o manager da transação
      if (createUser.phone) {
        const existsPhone = await queryRunner.manager.findOne(UserEntity, { where: { phone: createUser.phone } });
        if (existsPhone) throw new BadRequestException('Número de telefone já cadastrado.');
      }

      if (createUser.email) {
        const existsEmail = await queryRunner.manager.findOne(UserEntity, { where: { email: createUser.email } });
        if (existsEmail) throw new BadRequestException('E-mail já cadastrado.');
      }

      const userEntity: UserEntity = new UserEntity();
      userEntity.userType = createUser.userType;
      userEntity.name = createUser.name;
      userEntity.email = createUser.email;
      userEntity.phone = createUser.phone;
      userEntity.password = senhaHasheada;

      const createdUser: UserEntity = await queryRunner.manager.save(UserEntity, userEntity);

      if(createUser.userType === UserTypeEnum.PERSON && createUser.person != null){
        if(!this.validateCPF(createUser.person.cpf))
           throw new BadRequestException('CPF inválido.');

        const existsCpf = await queryRunner.manager.findOne(PersonEntity, { where: { cpf: createUser.person.cpf } });
        if (existsCpf) throw new BadRequestException('CPF já cadastrado.');

        const personEntity: PersonEntity = new PersonEntity();
        personEntity.cpf = createUser.person.cpf;
        personEntity.birthDate = createUser.person.birthDate;
        personEntity.gender = createUser.person.gender;
        personEntity.riskLevel = createUser.person.riskLevel;
        personEntity.user = createdUser;

        const createdPerson = await queryRunner.manager.save(PersonEntity, personEntity);
        createdUser.person = createdPerson;
        await queryRunner.manager.save(UserEntity, createdUser);
      }
      else if(createUser.userType === UserTypeEnum.INSTITUITION && createUser.instituition != null){
        if(!this.validateCNPJ(createUser.instituition.cnpj))
          throw new BadRequestException('CNPJ inválido.');

        const existsCnpj = await queryRunner.manager.findOne(InstituitionEntity, { where: { cnpj: createUser.instituition.cnpj } });
        if (existsCnpj) throw new BadRequestException('CNPJ já cadastrado.');

        const instituitionEntity: InstituitionEntity = new InstituitionEntity();
        instituitionEntity.cnpj = createUser.instituition.cnpj;
        instituitionEntity.foundationDate = createUser.instituition.foundationDate;
        if(createUser.instituition.segment)
          instituitionEntity.segment = createUser.instituition.segment;

        instituitionEntity.user = createdUser;
        const createdInstituition = await queryRunner.manager.save(InstituitionEntity, instituitionEntity);
        createdUser.instituition = createdInstituition;
        await queryRunner.manager.save(UserEntity, createdUser);
      }
      else{
        throw new BadRequestException('Tipo de usuário inválido.');
      }

      await queryRunner.commitTransaction();

      return{statusCode: 201, message: 'Usuário cadastrado com sucesso.'};

    } catch (erro) {
      await queryRunner.rollbackTransaction();
      console.log(erro);
      if(erro instanceof BadRequestException)
        throw erro;
      throw new InternalServerErrorException('Erro interno. Verifique os dados e tente novamente.')
    } finally {
      await queryRunner.release();
    }
  }

  async findByIdentifier(parameter: number | string, withRelations: boolean = false): Promise<UserEntity | null>{
    if(typeof parameter === 'number'){
      let user: UserEntity | null;
      if(withRelations){
        user = await this.userRepository.findOne({
          where: {id: parameter},
          relations: ['person', 'instituition']
        })
      } else {
        user = await this.userRepository.findOneBy({id: parameter})
      }
      if(user) return user;

    } else if (typeof parameter === 'string'){
      let user: UserEntity | null;
      if(withRelations){
        user = await this.userRepository.findOne({
          where: {email: parameter},
          relations: ['person', 'instituition']
        })
      } else {
        user = await this.userRepository.findOne({where: {email: parameter}})
      }
      if(user) return user;

      if(withRelations){
        user = await this.userRepository.findOne({
          where: {phone: parameter},
          relations: ['person', 'instituition']
        })
      } else {
        user = await this.userRepository.findOne({where: {phone: parameter}})
      }
      if(user) return user;

      let userPerson = await this.userPersonRepository.findOne({where: {cpf: parameter}, relations: ['user']})
      if(userPerson) {
        user = await this.userRepository.findOne({
          where: {id: userPerson.user.id},
          relations: withRelations ? ['person', 'instituition'] : []
        })
      }
    
      let userInstituition = await this.userInstituitionRepository.findOne({where: {cnpj: parameter}, relations: ['user']})
      if(userInstituition) {
        user = await this.userRepository.findOne({
          where: {id: userInstituition.user.id},
          relations: withRelations ? ['person', 'instituition'] : []
        })
      }
      
      if(user) return user;
    }
    
    return null;
  }

  async findOne(parameter: number | string): Promise<ListUserDTO> {
    try {
      const user = await this.findByIdentifier(parameter);

      if(!user) throw new NotFoundException('Usuário não encontrado.');

      return plainToInstance(ListUserDTO, user, {excludeExtraneousValues: true});
      
    }catch(erro){
      console.log(erro);

      if(erro instanceof NotFoundException)
        throw erro;
      else
        throw new InternalServerErrorException('Erro interno. Verifique os dados e tente novamente.');
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

  async update(id: number, updateUserDto: UpdateUserDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{ 

      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id },
        relations: ['person', 'instituition']
      });

      if(!user)
        throw new NotFoundException('Usuário não encontrado.');
      
      if(updateUserDto.email && updateUserDto.email !== user.email) {
        const emailExists = await queryRunner.manager.findOne(UserEntity, {
          where: { email: updateUserDto.email }
        });
        if(emailExists)
          throw new BadRequestException('E-mail já cadastrado.');
      }

      if(updateUserDto.phone && updateUserDto.phone !== user.phone) {
        const phoneExists = await queryRunner.manager.findOne(UserEntity, {
          where: { phone: updateUserDto.phone }
        });
        if(phoneExists)
          throw new BadRequestException('Número de telefone já cadastrado.');
      }

      const userUpdateData: Partial<UserEntity> = {};
      if(updateUserDto.name !== undefined) userUpdateData.name = updateUserDto.name;
      if(updateUserDto.email !== undefined) userUpdateData.email = updateUserDto.email;
      if(updateUserDto.phone !== undefined) userUpdateData.phone = updateUserDto.phone;

      if(Object.keys(userUpdateData).length > 0) {
        await queryRunner.manager.update(UserEntity, { id: user.id }, userUpdateData);
      }

      if(user.userType === UserTypeEnum.PERSON && updateUserDto.person) {
        if(!user.person)
          throw new BadRequestException('Usuário não possui dados de pessoa.');

        const personUpdateData: Partial<PersonEntity> = {};
        if(updateUserDto.person.birthDate !== undefined) personUpdateData.birthDate = updateUserDto.person.birthDate;
        if(updateUserDto.person.gender !== undefined) personUpdateData.gender = updateUserDto.person.gender;
        if(updateUserDto.person.riskLevel !== undefined) personUpdateData.riskLevel = updateUserDto.person.riskLevel;

        if(Object.keys(personUpdateData).length > 0) {
          await queryRunner.manager.update(PersonEntity, { id: user.person.id }, personUpdateData);
        }
      }
      
      if(user.userType === UserTypeEnum.INSTITUITION && updateUserDto.instituition) {
        if(!user.instituition)
          throw new BadRequestException('Usuário não possui dados de instituição.');

        const instituitionUpdateData: Partial<InstituitionEntity> = {};
        if(updateUserDto.instituition.foundationDate !== undefined) instituitionUpdateData.foundationDate = updateUserDto.instituition.foundationDate;
        if(updateUserDto.instituition.segment !== undefined) instituitionUpdateData.segment = updateUserDto.instituition.segment;

        if(Object.keys(instituitionUpdateData).length > 0) {
          await queryRunner.manager.update(InstituitionEntity, { id: user.instituition.id }, instituitionUpdateData);
        }
      }
      
      await queryRunner.commitTransaction();
      return {statusCode: 200, message: 'Atualizado com sucesso.'};

    } catch(erro) {
      await queryRunner.rollbackTransaction();
      console.log(erro);

      if(erro instanceof NotFoundException || erro instanceof BadRequestException)
        throw erro;

      throw new InternalServerErrorException('Erro ao atualizar cadastro. Tente novamente.');
    } finally {
      await queryRunner.release();
    }
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
