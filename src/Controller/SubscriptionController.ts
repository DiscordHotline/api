import {inject, tagged} from 'inversify';
import {
    BaseHttpController,
    controller,
    httpDelete,
    httpGet,
    httpPost,
    queryParam,
    requestBody,
    requestParam,
    results,
} from 'inversify-express-utils';
import {Connection} from 'typeorm';
import {Logger} from 'winston';

import Consumer from '..//Entity/Consumer';
import Subscription from '../Entity/Subscription';
import Tag from '../Entity/Tag';
import SubscriptionManager from '../Manager/SubscriptionManager';
import Validate from '../Middleware/Validate';
import SubscriptionModel from '../Model/Body/Subscription';
import {PERMISSIONS} from '../Permissions';
import {isGranted} from '../Security/Authorizer';
import Types from '../types';

@controller('/subscription')
export class SubscriptionController extends BaseHttpController {
    public constructor(
        @inject(Types.database) private database: Connection,
        @inject(Types.logger) private logger: Logger,
        @inject(Types.manager.entity) @tagged('entity', Subscription) private manager: SubscriptionManager,
    ) {
        super();
    }

    @httpPost('/', isGranted(PERMISSIONS.WRITE_SUBSCRIPTIONS), Validate(SubscriptionModel))
    private async create(@requestBody() body: SubscriptionModel): Promise<results.JsonResult> {
        const consumerRepo = this.database.getRepository<Consumer>(Consumer);
        const tagRepo      = this.database.getRepository<Tag>(Tag);

        return this.json(
            await this.manager.create(async (x) => {
                x.consumer = await consumerRepo.findOneOrFail(body.consumer);
                x.tags     = [];
                for (const tag of body.tags) {
                    x.tags.push(await tagRepo.findOneOrFail(tag));
                }
            }),
            200,
        );
    }

    @httpGet('/', isGranted(PERMISSIONS.LIST_SUBSCRIPTIONS))
    private async list(
        @queryParam('from') from: number = 0,
        @queryParam('size') size: number = 50,
        @queryParam('tags') tags?: string,
    ): Promise<results.JsonResult> {
        const repo = this.database.getRepository<Subscription>(Subscription);
        const qb   = repo.createQueryBuilder('subscription')
                         .innerJoinAndSelect('subscription.tags', 'tags')
                         .skip(from)
                         .take(size || 50)
                         .orderBy('subscription.id', 'ASC');

        if (tags) {
            qb.where('tags.id IN(:tags)', {tags: tags.split(',')});
        }

        try {
            const [results, count] = await qb.getManyAndCount();

            return this.json({count, results});
        } catch (e) {
            this.logger.error('Failed to create a subscription list: %O', e);

            return this.json({message: 'An error has occurred while fetching subscription'}, 500);
        }
    }

    @httpGet('/:id', isGranted(PERMISSIONS.READ_SUBSCRIPTIONS))
    private async get(@requestParam('id') id: number): Promise<results.JsonResult> {
        const repository = this.database.getRepository<Subscription>(Subscription);
        try {
            return this.json(await repository.findOneOrFail(id));
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404);
        }
    }

    @httpDelete('/:id', isGranted(PERMISSIONS.DELETE_SUBSCRIPTIONS))
    private async delete(@requestParam('id') id: number): Promise<results.StatusCodeResult> {
        const repository = this.database.getRepository<Subscription>(Subscription);
        const consumer   = await repository.findOne(id);
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

    @httpPost('/:id', isGranted(PERMISSIONS.EDIT_SUBSCRIPTIONS), Validate(SubscriptionModel))
    private async edit(
        @requestParam('id') id: number,
        @requestBody() body: SubscriptionModel,
    ): Promise<results.JsonResult | results.StatusCodeResult> {
        const repository   = this.database.getRepository<Subscription>(Subscription);
        const subscription = await repository.findOne(id);
        if (!subscription) {
            return this.statusCode(404);
        }

        const tagRepo = this.database.getRepository<Tag>(Tag);

        return this.json(
            await this.manager.update(
                subscription,
                async (x) => {
                    x.tags = [];
                    for (const tag of body.tags) {
                        x.tags.push(await tagRepo.findOneOrFail(tag));
                    }
                },
            ),
            200,
        );
    }
}
