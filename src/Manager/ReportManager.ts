import {injectable} from 'inversify';

import Report from '../Entity/Report';
import AbstractManager from './AbstractManager';

@injectable()
export default class ReportManager extends AbstractManager<Report> {
    protected createInstance(): Report {
        const instance             = new Report();
        instance.tags              = [];
        instance.reportedUsers     = [];
        instance.confirmationUsers = [];
        instance.links             = [];

        return instance;
    }
}
