import {BaseEntity, Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import ReportCategoryEnum from '../ReportCategory';
import Report from './Report';
import Tag from './Tag';
import User from './User';

@Entity('confirmation')
export default class Confirmation {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type) => Report, (report) => report.confirmations, {nullable: false, lazy: true})
    public report: Report;

    @ManyToOne((type) => User, {eager: true, nullable: false})
    public user: User;

    @Column({type: 'bigint'})
    public guild: string;

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();
}
