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

import Report from '../Entity/Report';
import User from '../Entity/User';
import AbstractManager from '../Manager/AbstractManager';
import ReportManager from '../Manager/ReportManager';
import UserManager from '../Manager/UserManager';
import Validate from '../Middleware/Validate';
import CreateReport from '../Model/Body/CreateReport';
import EditReport from '../Model/Body/EditReport';
import {PERMISSIONS} from '../Permissions';
import {ReportCategories} from '../ReportCategory';
import {isGranted} from '../Security/Authorizer';

import Types from '../types';

@controller('/report')
export class ReportController extends BaseHttpController {
    public constructor(
        @inject(Types.database) private database: Connection,
        @inject(Types.logger) private logger: Logger,
        @inject(Types.manager.entity) @tagged('entity', Report) private reportManager: ReportManager,
        @inject(Types.manager.entity) @tagged('entity', User) private userManager: UserManager,
    ) {
        super();
    }

    @httpGet('/categories')
    private index(): results.JsonResult {
        return this.json(ReportCategories, 200);
    }

    @httpPost('/', isGranted(PERMISSIONS.WRITE_REPORTS), Validate(CreateReport))
    private async create(@requestBody() body: CreateReport): Promise<results.JsonResult> {
        const repo   = this.database.getRepository(User);
        const report = await this.reportManager.create(async (x) => {
            x.reporter = await this.userManager.findOneByIdOrCreate(body.Reporter);
            x.category = body.Category;
            x.reason   = body.Reason;
            x.guildId  = body.GuildId;
            x.links    = body.Links;

            for (const id of body.ReportedUsers) {
                x.reportedUsers.push(await this.userManager.findOneByIdOrCreate(id));
            }
        });

        return this.json(report, 200);
    }

    @httpGet('/', isGranted(PERMISSIONS.LIST_REPORTS))
    private async list(
        @queryParam('from') from: number,
        @queryParam('size') size: number,
        @queryParam('reporter') reporter: string,
        @queryParam('reported') reported: string,
    ): Promise<results.JsonResult> {
        const repo = this.database.getRepository<Report>(Report);
        const qb   = repo.createQueryBuilder('report')
                         .innerJoinAndSelect('report.reporter', 'reporter')
                         .leftJoinAndSelect('report.reportedUsers', 'reportedUsers')
                         .leftJoinAndSelect('report.confirmationUsers', 'confirmationUsers')
                         .skip(from)
                         .take(size || 50)
                         .orderBy('report.id', 'DESC');

        if (reporter) {
            qb.andWhere('report.reporter = :reporter', {reporter});
        }

        if (reported) {
            qb.andWhere('reportedUsers.id = :reported', {reported});
        }

        try {
            const [results, count] = await qb.getManyAndCount();

            return this.json({count, results});
        } catch (e) {
            this.logger.error('Failed to create a report list: %O', e);

            return this.json({message: 'An error has occurred while fetching reports'}, 500);
        }
    }

    @httpGet('/:id', isGranted(PERMISSIONS.READ_REPORTS))
    private async get(@requestParam('id') id: number): Promise<results.JsonResult> {
        const reportRepository = this.database.getRepository<Report>(Report);
        try {
            return this.json(await reportRepository.findOneOrFail(id));
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404);
        }
    }

    @httpDelete('/:id', isGranted(PERMISSIONS.DELETE_REPORTS))
    private async delete(@requestParam('id') id: number): Promise<results.StatusCodeResult> {
        const reportRepository = this.database.getRepository<Report>(Report);
        let report: Report;

        try {
            report = await reportRepository.findOneOrFail(id);
        } catch (e) {
            return this.statusCode(404);
        }

        try {
            await report.remove();

            return this.statusCode(204);
        } catch (e) {
            this.logger.error(`Failed delete report ${id}: %O`, e);

            return this.statusCode(500);
        }
    }

    @httpPost('/:id', isGranted(PERMISSIONS.EDIT_REPORTS), Validate(EditReport))
    private async edit(
        @requestParam('id') id: number,
        @requestBody() body: EditReport,
    ): Promise<results.JsonResult | results.StatusCodeResult> {
        const reportRepository = this.database.getRepository(Report);
        const report           = await reportRepository.findOne(id);
        if (!report) {
            return this.statusCode(404);
        }

        await this.reportManager.update(report, async (x) => {
            x.category = body.Category;
            x.reason   = body.Reason;
            x.guildId  = body.GuildId;
            for (const userId of body.ReportedUsers) {
                x.reportedUsers.push(await this.userManager.findOneByIdOrCreate(userId));
            }
        });

        return this.json(report, 200);
    }
}
