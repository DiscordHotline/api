import {inject, tagged} from 'inversify';
import {
    BaseHttpController,
    controller,
    httpDelete,
    httpGet,
    httpPost,
    queryParam, request,
    requestBody,
    requestParam,
    results,
} from 'inversify-express-utils';
import {Connection} from 'typeorm';
import {Logger} from 'winston';
import Consumer from '../Entity/Consumer';
import ConsumerManager from '../Manager/ConsumerManager';
import Validate from '../Middleware/Validate';
import ConsumerModel from '../Model/Body/Consumer';
import {PERMISSIONS} from '../Permissions';
import {isGranted} from '../Security/Authorizer';

import Types from '../types';

@controller('/consumer')
export class ConsumerController extends BaseHttpController {
    public constructor(
        @inject(Types.database) private database: Connection,
        @inject(Types.logger) private logger: Logger,
        @inject(Types.manager.entity) @tagged('entity', Consumer) private manager: ConsumerManager,
    ) {
        super();
    }

    @httpPost('/', isGranted(PERMISSIONS.WRITE_CONSUMERS), Validate(ConsumerModel))
    private async create(@requestBody() body: ConsumerModel): Promise<results.JsonResult> {
        return this.json(await this.manager.create(body), 200);
    }

    @httpGet('/', isGranted(PERMISSIONS.LIST_CONSUMERS))
    private async list(
        @queryParam('from') from: number = 0,
        @queryParam('size') size: number = 50,
        @queryParam('name') name?: string,
    ): Promise<results.JsonResult> {
        const repo = this.database.getRepository<Consumer>(Consumer);
        const qb   = repo.createQueryBuilder('consumer')
                         .skip(from)
                         .take(size || 50)
                         .orderBy('id', 'ASC');
        if (name) {
            qb.where('name = :name', {name});
        }

        try {
            const [results, count] = await qb.getManyAndCount();

            return this.json({count, results});
        } catch (e) {
            this.logger.error('Failed to create a consumer list: %O', e);

            return this.json({message: 'An error has occurred while fetching consumers'}, 500);
        }
    }

    @httpGet('/:id', isGranted(PERMISSIONS.READ_CONSUMERS))
    private async get(@requestParam('id') id: number): Promise<results.JsonResult> {
        const repository = this.database.getRepository<Consumer>(Consumer);
        try {
            return this.json(await repository.findOneOrFail(id));
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404);
        }
    }

    @httpDelete('/:id', isGranted(PERMISSIONS.DELETE_CONSUMERS))
    private async delete(@requestParam('id') id: number): Promise<results.StatusCodeResult> {
        const repository = this.database.getRepository<Consumer>(Consumer);
        const consumer        = await repository.findOne(id);
        if (!consumer) {
            return this.statusCode(404);
        }

        try {
            await repository.remove(consumer);

            return this.statusCode(204);
        } catch (e) {
            this.logger.error(`Failed delete consumer %d: %O`, id, e);

            return this.statusCode(500);
        }
    }

    @httpPost('/:id', isGranted(PERMISSIONS.EDIT_CONSUMERS), Validate(ConsumerModel))
    private async edit(
        @requestParam('id') id: number,
        @requestBody() body: ConsumerModel,
    ): Promise<results.JsonResult | results.StatusCodeResult> {
        const repository = this.database.getRepository<Consumer>(Consumer);
        const consumer        = await repository.findOne(id);
        if (!consumer) {
            return this.statusCode(404);
        }

        return this.json(await this.manager.update(consumer, body), 200);
    }
}
