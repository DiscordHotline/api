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
import Category from '../Entity/Category';
import CategoryManager from '../Manager/CategoryManager';
import Validate from '../Middleware/Validate';
import CategoryModel from '../Model/Body/Category';
import {PERMISSIONS} from '../Permissions';
import {isGranted} from '../Security/Authorizer';

import Types from '../types';

@controller('/category')
export class CategoryController extends BaseHttpController {
    public constructor(
        @inject(Types.database) private database: Connection,
        @inject(Types.logger) private logger: Logger,
        @inject(Types.manager.entity) @tagged('entity', Category) private manager: CategoryManager,
    ) {
        super();
    }

    @httpPost('/', isGranted(PERMISSIONS.WRITE_CATEGORIES), Validate(CategoryModel))
    private async create(@requestBody() body: CategoryModel): Promise<results.JsonResult> {
        return this.json(await this.manager.create(body), 200);
    }

    @httpGet('/', isGranted(PERMISSIONS.LIST_CATEGORIES))
    private async list(
        @queryParam('from') from: number = 0,
        @queryParam('size') size: number = 50,
        @queryParam('name') name?: string,
    ): Promise<results.JsonResult> {
        const repo = this.database.getRepository<Category>(Category);
        const qb   = repo.createQueryBuilder('category')
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
            this.logger.error('Failed to create a category list: %O', e);

            return this.json({message: 'An error has occurred while fetching categorys'}, 500);
        }
    }

    @httpGet('/:id', isGranted(PERMISSIONS.READ_CATEGORIES))
    private async get(@requestParam('id') id: number): Promise<results.JsonResult> {
        const repository = this.database.getRepository<Category>(Category);
        try {
            return this.json(await repository.findOneOrFail(id));
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404);
        }
    }

    @httpDelete('/:id', isGranted(PERMISSIONS.DELETE_CATEGORIES))
    private async delete(@requestParam('id') id: number): Promise<results.StatusCodeResult> {
        const repository = this.database.getRepository<Category>(Category);
        const category        = await repository.findOne(id);
        if (!category) {
            return this.statusCode(404);
        }

        try {
            await repository.remove(category);

            return this.statusCode(204);
        } catch (e) {
            this.logger.error(`Failed delete category %d: %O`, id, e);

            return this.statusCode(500);
        }
    }

    @httpPost('/:id', isGranted(PERMISSIONS.EDIT_CATEGORIES), Validate(CategoryModel))
    private async edit(
        @requestParam('id') id: number,
        @requestBody() body: CategoryModel,
    ): Promise<results.JsonResult | results.StatusCodeResult> {
        const repository = this.database.getRepository<Category>(Category);
        const category        = await repository.findOne(id);
        if (!category) {
            return this.statusCode(404);
        }

        return this.json(await this.manager.update(category, body), 200);
    }
}
