import {validate} from 'class-validator';
import {inject} from 'inversify';
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
    ) {
        super();
    }

    @httpGet('/categories')
    private index(): results.JsonResult {
        return this.json(ReportCategories, 200);
    }

    @httpPost('/', isGranted(PERMISSIONS.WRITE_REPORTS))
    private async create(@requestBody() req: Partial<CreateReport>): Promise<results.JsonResult> {
        const body = new CreateReport(req);
        const repo = this.database.getRepository(User);

        const errors = await validate(body);
        if (errors.length > 0) {
            return this.json({message: 'Failed Validation', errors}, 400);
        }

        const report    = new Report();
        report.Reporter = await repo.findOne(body.Reporter) || new User(body.Reporter);
        await report.Reporter.save();

        report.Category = body.Category;
        report.Reason   = body.Reason;
        report.GuildId  = body.GuildId;
        report.Links    = body.Links;

        for (const x of body.ReportedUsers) {
            const user = await repo.findOne(x) || new User(x);
            await user.save();
            if (!report.ReportedUsers) {
                report.ReportedUsers = [];
            }

            report.ReportedUsers.push(user);
        }

        await report.save();

        return this.json(report, 200);
    }

    @httpGet('/list', isGranted(PERMISSIONS.LIST_REPORTS))
    private async list(
        @queryParam('from') from: number,
        @queryParam('size') size: number,
        @queryParam('reporter') reporter: string,
        // @todo Add reported param
        // @queryParam('reported') reported: string,
    ): Promise<results.JsonResult> {
        const reportRepository = this.database.getRepository(Report);
        const findOptions: any = {
            skip:  from,
            take:  size || 50,
            order: {
                Id: 'DESC',
            },
        };

        if (reporter) {
            findOptions.where = {
                Reporter: reporter,
            };
        }

        try {
            const reportCount = await reportRepository.count();
            const reports     = await reportRepository.find(findOptions);

            return this.json({reportCount, reports});
        } catch (e) {
            this.logger.error('Failed to create a report list: %O', e);

            return this.json({message: 'An error has occurred while fetching reports'}, 500);
        }
    }

    @httpGet('/:id', isGranted(PERMISSIONS.READ_REPORTS))
    private async get(@requestParam('id') id: number): Promise<results.JsonResult> {
        const reportRepository = this.database.getRepository(Report);
        let report;

        try {
            report = await reportRepository.findOneOrFail(id);
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404);
        }

        return this.json(report, 200);
    }

    @httpDelete('/:id', isGranted(PERMISSIONS.DELETE_REPORTS))
    private async delete(@requestParam('id') id: number): Promise<results.StatusCodeResult> {
        const reportRepository = this.database.getRepository(Report);
        let report;

        try {
            report = await reportRepository.findOneOrFail(id);
        } catch (e) {
            return this.statusCode(404);
        }

        try {
            await report.remove();
        } catch (e) {
            this.logger.error(`Failed delete report ${id}: %O`, e);

            return this.statusCode(500);
        }

        return this.statusCode(204);
    }

    @httpPost('/:id', isGranted(PERMISSIONS.EDIT_REPORTS))
    private async edit(
        @requestParam('id') id: number,
        @requestBody() req: Partial<EditReport>,
    ): Promise<results.JsonResult> {
        const body = new EditReport(req);

        const errors = await validate(body);
        if (errors.length > 0) {
            return this.json({message: 'Failed Validation', errors}, 400);
        }

        const reportRepository = this.database.getRepository(Report);
        const userRepository   = this.database.getRepository(User);
        let report;
        try {
            report = await reportRepository.findOneOrFail(id);
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404);
        }

        report.Category                     = body.Category;
        report.Reason                       = body.Reason;
        report.GuildId                      = body.GuildId;
        const promises: Array<Promise<any>> = [];
        for (const x of body.ReportedUsers) {
            const user = await userRepository.findOne(x) || new User(x);
            if (!report.ReportedUsers) {
                report.ReportedUsers = [];
            }

            report.ReportedUsers.push(user);
            promises.push(user.save());
        }

        await Promise.all([...promises, report.save()]);

        return this.json(report, 200);
    }
}
