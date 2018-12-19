import * as express from 'express';
import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet, httpPost, results} from 'inversify-express-utils';
import {Connection} from 'typeorm';
import ReportedUser from '../Entity/ReportedUser';

import Types from '../types';
import Report from '../Entity/Report';
import CreateReportInterface from '../Interface/Body/CreateReportInterface';
import {ReportCategories} from '../ReportCategory';

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
     * Body: CreateReportInterface
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
        const body: CreateReportInterface = req.body;
        const repo = this.database.getRepository(ReportedUser);

        const report = new Report();
        report.Reporter = body.Reporter;
        report.Category = body.Category;
        report.Reason = body.Reason;
        report.GuildId = body.GuildId;
        for (const x of body.ReportedUsers) {
            let user = await repo.findOne({UserId: x});
            if (!user) {
                user = new ReportedUser();
                user.UserId = x;
                await user.save();
            }

            report.ReportedUsers.push(user);
        }

        await report.save();

        return this.json(report, 200);
    }
}
