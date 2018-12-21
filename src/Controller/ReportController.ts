import {validate} from 'class-validator';
import * as express from 'express';
import {inject} from 'inversify';
import {
    BaseHttpController,
    controller,
    httpGet,
    httpPost,
    requestBody,
    requestHeaders, requestParam,
    results,
} from 'inversify-express-utils';
import {Connection} from 'typeorm';

import Report from '../Entity/Report';
import User from '../Entity/User';
import CreateReport from '../Model/Body/CreateReport';
import EditReport from '../Model/Body/EditReport';
import {PERMISSIONS} from '../Permissions';
import {ReportCategories} from '../ReportCategory';
import Authorizer from '../Security/Authorizer';

import Types from '../types';

@controller('/report')
export class ReportController extends BaseHttpController {
    public constructor(
        @inject(Types.database) private database: Connection,
        @inject(Types.authorizer) private authorizer: Authorizer,
    ) {
        super();
    }

    @httpGet('/categories')
    private index(req: express.Request, res: express.Response, next: express.NextFunction): results.JsonResult {
        return this.json(ReportCategories, 200);
    }

    @httpPost('/')
    private async create(
        @requestBody() req: Partial<CreateReport>,
        @requestHeaders('Authorization') token: string,
    ): Promise<results.JsonResult> {
        // @todo Clean up in to a decorator/middleware combo.
        const authResult = await this.authorizer.isAuthorized(
            this.json,
            token,
            PERMISSIONS.WRITE_REPORTS,
        );
        if (!!authResult) {
            return authResult;
        }

        const body = new CreateReport(req);
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

    @httpGet('/:id')
    private async get (
        @requestParam('id') id: number,
        @requestHeaders('Authorization') token: string,
    ): Promise<results.JsonResult> {
        // @todo Clean up in to a decorator/middleware combo.
        const authResult = await this.authorizer.isAuthorized(
            this.json,
            token,
            PERMISSIONS.READ_REPORTS,
        );
        if (!!authResult) {
            return authResult
        }

        const reportRepository = this.database.getRepository(Report)
        let report

        try {
            report = await reportRepository.findOneOrFail(id)
        } catch (e) {
            return this.json({message: 'Failed to find report with that id'}, 404)
        }

        return this.json(report, 200)
    }

    @httpPost('/:id')
    private async edit(
        @requestParam('id') id: number,
        @requestBody() req: Partial<EditReport>,
        @requestHeaders('Authorization') token: string,
    ): Promise<results.JsonResult> {
        // @todo Clean up in to a decorator/middleware combo.
        const authResult = await this.authorizer.isAuthorized(
            this.json,
            token,
            PERMISSIONS.EDIT_REPORTS,
        );
        if (!!authResult) {
            return authResult;
        }
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

        report.Category                = body.Category;
        report.Reason                  = body.Reason;
        report.GuildId                 = body.GuildId;
        const promises: Promise<any>[] = [];
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
