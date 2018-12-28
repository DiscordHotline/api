import {inject, injectable} from 'inversify';
import {Connection, Repository} from 'typeorm';

import Consumer from '../Entity/Consumer';
import {hasPermission, PERMISSIONS} from '../Permissions';

import Types from '../types';

export interface AuthResult {
    passed: boolean;
    consumer?: Consumer;
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

        const consumer = await this.repository.findOne({apiKey: token});
        if (!consumer) {
            return {passed: false, reason: 'Bad API Key', code: 401};
        }

        if (hasPermission(PERMISSIONS.ADMINISTRATOR, consumer.permissions)) {
            return {passed: true, consumer};
        }

        for (const perm of permissions) {
            if (!hasPermission(perm, consumer.permissions)) {
                return {passed: false, reason: 'Forbidden', code: 403, consumer};
            }
        }

        return {passed: true, consumer};
    }
}

let authorizer: Authorizer;
export const setAuthorizorForMiddleware = (_authorizer: Authorizer) => authorizer = _authorizer;

export const isGranted = (...permissions: number[]) => async (req, res, next): Promise<any> => {
    const authResult = await authorizer.isAuthorized(req.get('Authorization'), ...permissions);
    req.consumer     = authResult.consumer;
    if (authResult.passed) {
        return next();
    }

    return res.status(authResult.code).json({message: authResult.reason});
};
