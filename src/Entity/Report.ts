import {BaseEntity, Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import ReportCategoryEnum from '../ReportCategory';
import User from './User';

@Entity('report')
export default class Report extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type) => User, {eager: true})
    @JoinTable()
    public reporter: User;

    @Column() @Index('category', ['category'])
    public category: ReportCategoryEnum;

    @Column({type: 'text'})
    public reason: string;

    @Column({type: 'bigint', nullable: true}) @Index('guild', ['guildId'])
    public guildId?: string;

    @Column({type: 'simple-array'})
    public messageIds: string[] = [];

    @Column({type: 'simple-array'})
    public links: string[];

    @ManyToMany((type) => User, {eager: true})
    @JoinTable({name: 'reported_users'})
    public reportedUsers: User[];

    @ManyToMany((type) => User, {eager: true})
    @JoinTable({name: 'confirmation_users'})
    public confirmationUsers: User[];

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();

    @Column({type: 'datetime'}) @Index('update_date', ['updateDate'])
    public updateDate: Date = new Date();
}
