import {injectable} from 'inversify';

import Report from '../Entity/Report';
import AbstractManager from './AbstractManager';

interface MatchesAndReport {
    matches: number;
    report: Report;
}

@injectable()
export default class ReportManager extends AbstractManager<Report> {
    public async getExistingReport(ids: string[]): Promise<MatchesAndReport[]> {
        const repo    = this.database.getRepository<Report>(Report);
        const results = await repo.createQueryBuilder('report')
                                  .leftJoinAndSelect('report.reportedUsers', 'reportedUsers')
                                  .leftJoin('report.reportedUsers', 'users')
                                  .where('users.id IN(:ids)', {ids})
                                  .orderBy('report.id', 'ASC')
                                  .getMany();

        const existing: MatchesAndReport[] = [];
        for (const result of results) {
            let matches = 0;
            result.reportedUsers.forEach((x) => ids.forEach((y) => matches += x.id === y ? 1 : 0));
            if (matches > ids.length / 2) {
                existing.push({matches, report: result});
            }
        }

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
