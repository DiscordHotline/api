import {BaseEntity, Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn, Table} from 'typeorm';
import Report from './Report';

@Entity('ReportedUser')
export default class ReportedUser extends BaseEntity {
    @PrimaryGeneratedColumn()
    public Id: number;

    @Column({type: 'bigint'}) @Index('user_id', ['UserId'])
    public UserId: string;

    @ManyToMany(type => Report, report => report.ReportedUsers)
    public Reports: Report[];

    @Column({type: 'datetime'}) @Index('insert_date', ['InsertDate'])
    public InsertDate: Date = new Date;
}
