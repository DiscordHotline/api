import {injectable} from 'inversify';
import User from '../Entity/User';

import AbstractManager from './AbstractManager';

@injectable()
export default class UserManager extends AbstractManager<User> {
    public async findOneByIdOrCreate(id): Promise<User> {
        return await this.repository.findOne(id) || await this.create({id});
    }
}
