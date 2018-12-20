import {inject, injectable} from 'inversify';
import {results} from 'inversify-express-utils';
import {Connection, Repository} from 'typeorm';

import Consumer from '../Entity/Consumer';
import {hasPermission} from '../Permissions';

import Types from '../types';

@injectable()
export default class Authorizer {
    private repository: Repository<Consumer>;

    constructor(@inject(Types.database) connection: Connection) {
        this.repository = connection.getRepository<Consumer>(Consumer);
    }

    public async isAuthorized(
        json: (content: any, statusCode?: number) => results.JsonResult,
        token: string | undefined,
        ...permissions: number[]
    ): Promise<results.JsonResult | null> {
        if (!token) {
            return json({message: 'Unauthorized'}, 401);
        }
        token = token.replace('Bearer ', '');

        const consumer = await this.repository.findOne({ApiKey: token});
        if (!consumer) {
            return json({message: 'Bad API Key'}, 401);
        }

        for (const perm of permissions) {
            if (!hasPermission(perm, consumer.Permissions)) {
                return json({message: 'Forbidden'}, 403);
            }
        }

        return null;
    }
}
