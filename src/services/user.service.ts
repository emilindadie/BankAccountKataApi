import {getManager} from "typeorm";
import { UserEntity } from "../entity/user";
import { CreateUserDto } from "../model/user";
import { User } from "../model/user.i";
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

export class UserService {

    constructor(){
        dotenv.config();
    }
    async checkIfEmailExist(email : string) : Promise<Boolean>{
       const users = await getManager().getRepository(UserEntity).find({ where: { email: email } });
       if(users.length > 0){
           return true
       }
       return false;
    }

    async createUser(createUserDto : CreateUserDto) : Promise<any> {
        const emailExist = await this.checkIfEmailExist(createUserDto.email);
        if(emailExist){
            throw new Error("L'email existe deja!");
        }
        createUserDto.password = await this.cryptPassword(createUserDto.password);
        return await  getManager().getRepository(UserEntity).save(createUserDto);
    }

    async cryptPassword(password : string) : Promise<string>{
        return await bcrypt.hash(password, Number(process.env.SALT)).then(function(hash) {
            return hash;
        });
    }

    async comparePassword(password : string, hashpassword: string) : Promise<boolean> {
        const match = await bcrypt.compare(password, hashpassword);
        if(match) {
            return true
        }
        return false
    }

    async logUser(email : string, password: string) : Promise<User> {
        const users = await getManager().getRepository(UserEntity).find({ where: { email: email } });
        if(users.length == 0){
            throw new Error("L'email ou le mot de passe est incorrect!");
        }
        const canLogin = await this.comparePassword(password, users[0].password);
        if(canLogin){
            return users[0];
        }
        throw new Error("L'email ou le mot de passe est incorrect!");
    }
}
