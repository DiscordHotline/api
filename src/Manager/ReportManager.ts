import {injectable} from 'inversify';

import Report from '../Entity/Report';
import AbstractManager from './AbstractManager';

@injectable()
export default class ReportManager extends AbstractManager<Report> {
    public async getExistingReport(ids: string[]): Promise<Report[]> {
        const repo = this.database.getRepository<Report>(Report);
        const qb   = repo.createQueryBuilder('report')
                         .leftJoinAndSelect('report.reportedUsers', 'reportedUsers')
                         .leftJoinAndSelect('report.reportedUsers', 'users');

        qb.where('users.id IN(:ids)', {ids});

        const results = await qb.getMany();
        const existing: Report[] = [];
        for (let result of results) {
            result = await repo.findOneOrFail(result.id);
            let matches = 0;

            result.reportedUsers.forEach((x) => ids.forEach((y) => matches += x.id === y ? 1 : 0));
            if (matches > ids.length / 2) {
                existing.push(result);
            }
        }

        console.log(results);

        return existing;
    }

    protected createInstance(): Report {
        const instance         = new Report();
        instance.tags          = [];
        instance.reportedUsers = [];
        instance.confirmations = [];
        instance.links         = [];

        return instance;
    }
}
