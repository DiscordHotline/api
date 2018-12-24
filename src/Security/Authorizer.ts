import {inject, injectable} from 'inversify';
import {Connection, Repository} from 'typeorm';

import Consumer from '../Entity/Consumer';
import {hasPermission} from '../Permissions';

import Types from '../types';

export interface AuthResult {
    passed: boolean;
    reason?: string;
    code?: number;
}

@injectable()
export default class Authorizer {
    private repository: Repository<Consumer>;

    constructor(@inject(Types.database) connection: Connection) {
        this.repository = connection.getRepository<Consumer>(Consumer);
    }

    public async isAuthorized(
        token: string | undefined,
        ...permissions: number[]
    ): Promise<AuthResult> {
        if (!token) {
            return {passed: false, reason: 'Unauthorized', code: 401};
        }
        token = token.replace('Bearer ', '');

        const consumer = await this.repository.findOne({ApiKey: token});
        if (!consumer) {
            return {passed: false, reason: 'Bad API Key', code: 401};
        }

        for (const perm of permissions) {
            if (!hasPermission(perm, consumer.Permissions)) {
                return {passed: false, reason: 'Forbidden', code: 403};
            }
        }

        return {passed: true};
    }
}

let authorizer: Authorizer;
export const setAuthorizorForMiddleware = (_authorizer: Authorizer) => authorizer = _authorizer;

export const isGranted = (...permissions: number[]) => async (req, res, next): Promise<any> => {
    const authResult = await authorizer.isAuthorized(req.get('Authorization'), ...permissions);
    if (authResult.passed) {
        return next();
    }

    return res.status(authResult.code).json({message: authResult.reason});
};
