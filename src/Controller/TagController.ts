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
import {Connection, Repository} from 'typeorm';
import {Logger} from 'winston';
import Category from '../Entity/Category';
import Tag from '../Entity/Tag';
import TagManager from '../Manager/TagManager';
import Validate from '../Middleware/Validate';
import TagModel from '../Model/Body/Tag';
import {PERMISSIONS} from '../Permissions';
import {isGranted} from '../Security/Authorizer';

import Types from '../types';

@controller('/tag')
export class TagController extends BaseHttpController {
    private categoryRepository: Repository<Category>;

    public constructor(
        @inject(Types.database) private database: Connection,
        @inject(Types.logger) private logger: Logger,
        @inject(Types.manager.entity) @tagged('entity', Tag) private manager: TagManager,
    ) {
        super();
        this.categoryRepository = database.getRepository<Category>(Category);
    }

    @httpPost('/', isGranted(PERMISSIONS.WRITE_TAGS), Validate(TagModel))
    private async create(@requestBody() body: TagModel): Promise<results.JsonResult> {
        return this.json(
            await this.manager.create(
                async (x) => {
                    x.name     = body.name;
                    x.category = await this.categoryRepository.findOneOrFail(body.category);
                }),
            200,
        );
    }

    @httpGet('/', isGranted(PERMISSIONS.LIST_TAGS))
    private async list(
        @queryParam('from') from: number = 0,
        @queryParam('size') size: number = 50,
        @queryParam('category') category?: number,
        @queryParam('name') name?: string,
    ): Promise<results.JsonResult> {
        const repo = this.database.getRepository<Tag>(Tag);
        const qb   = repo.createQueryBuilder('tag')
                         .innerJoinAndSelect('tag.category', 'category')
                         .skip(from)
                         .take(size || 50)
                         .orderBy('category.id', 'ASC')
                         .addOrderBy('tag.id', 'ASC');

        if (category) {
            qb.where('category.id = :category', {category});
        }

        if (name) {
            qb.where('tag.name = :name', {name});
        }

        try {
            const [results, count] = await qb.getManyAndCount();

            return this.json({count, results});
        } catch (e) {
            this.logger.error('Failed to create a tag list: %O, %s, %j', e, qb.getSql(), qb.getParameters());

            return this.json({message: 'An error has occurred while fetching tags'}, 500);
        }
    }

    @httpGet('/:id', isGranted(PERMISSIONS.READ_TAGS))
    private async get(@requestParam('id') id: number): Promise<results.JsonResult> {
        const repository = this.database.getRepository<Tag>(Tag);
        try {
            return this.json(await repository.findOneOrFail(id));
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404);
        }
    }

    @httpDelete('/:id', isGranted(PERMISSIONS.DELETE_TAGS))
    private async delete(@requestParam('id') id: number): Promise<results.StatusCodeResult> {
        const repository = this.database.getRepository<Tag>(Tag);
        const tag        = await repository.findOne(id);
        if (!tag) {
            return this.statusCode(404);
        }

        try {
            await repository.remove(tag);

            return this.statusCode(204);
        } catch (e) {
            this.logger.error(`Failed delete tag %d: %O`, id, e);

            return this.statusCode(500);
        }
    }

    @httpPost('/:id', isGranted(PERMISSIONS.EDIT_TAGS), Validate(TagModel))
    private async edit(
        @requestParam('id') id: number,
        @requestBody() body: TagModel,
    ): Promise<results.JsonResult | results.StatusCodeResult> {
        const repository = this.database.getRepository<Tag>(Tag);
        const tag        = await repository.findOne(id);
        if (!tag) {
            return this.statusCode(404);
        }

        return this.json(
            await this.manager.update(
                tag,
                async (x) => {
                    x.name     = body.name;
                    x.category = await this.categoryRepository.findOneOrFail(body.category);
                },
            ),
            200,
        );
    }
}
