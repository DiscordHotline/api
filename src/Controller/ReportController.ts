import {validate} from 'class-validator';
import * as express from 'express';
import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet, httpPost, results} from 'inversify-express-utils';
import {Connection} from 'typeorm';
import Report from '../Entity/Report';
import User from '../Entity/User';
import CreateReport from '../Model/Body/CreateReport';
import EditReport from '../Model/Body/EditReport';
import {ReportCategories} from '../ReportCategory';

import Types from '../types';

@controller('/report')
export class ReportController extends BaseHttpController {
    public constructor(@inject(Types.database) private database: Connection) {
        super();
    }

    @httpGet('/categories')
    private index(req: express.Request, res: express.Response, next: express.NextFunction): results.JsonResult {
        return this.json(ReportCategories, 200);
    }

    /**
     * Accepts: application/json
     * Body: CreateReport
     * @param req
     * @param res
     * @param next
     */
    @httpPost('/')
    private async create(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<results.JsonResult> {
        const body = new CreateReport(req.body);
        const repo = this.database.getRepository(User);

        const errors = await validate(body);
        if (errors.length > 0) {
            return this.json({message: 'Failed Validation', errors}, 400);
        }

        const report    = new Report();
        report.Reporter = await repo.findOne(body.Reporter) || new User(body.Reporter);
        report.Category = body.Category;
        report.Reason   = body.Reason;
        report.GuildId  = body.GuildId;

        const promises: Promise<any>[] = [];
        for (const x of body.ReportedUsers) {
            const user = await repo.findOne(x) || new User(x);
            await user.save();
            if (!report.ReportedUsers) {
                report.ReportedUsers = [];
            }

            report.ReportedUsers.push(user);
            promises.push(user.save())
        }

        await report.save();

        return this.json(report, 200);
    }

    /**
     * Accepts: application/json
     * Body: CreateReport
     * @param req
     * @param res
     * @param next
     */
    @httpPost('/:id')
    private async edit(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<results.JsonResult> {
        const body = new EditReport(req.body);

        const errors = await validate(body);
        if (errors.length > 0) {
            return this.json({message: 'Failed Validation', errors}, 400);
        }

        const reportRepository       = this.database.getRepository(Report);
        const userRepository = this.database.getRepository(User);
        let report;
        try {
            report = await reportRepository.findOneOrFail(req.params.id);
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404);
        }

        report.Category = body.Category;
        report.Reason   = body.Reason;
        report.GuildId  = body.GuildId;
        const promises: Promise<any>[] = [];
        for (const x of body.ReportedUsers) {
            const user = await userRepository.findOne(x) || new User(x);
            if (!report.ReportedUsers) {
                report.ReportedUsers = [];
            }

            report.ReportedUsers.push(user);
            promises.push(user.save())
        }

        await Promise.all([...promises, report.save()]);

        return this.json(report, 200);
    }

}
