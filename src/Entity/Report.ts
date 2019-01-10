import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import ReportCategoryEnum from '../ReportCategory';
import Confirmation from './Confirmation';
import Tag from './Tag';
import User from './User';

@Entity('report')
export default class Report {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type) => User, {eager: true})
    @JoinTable()
    public reporter: User;

    @ManyToMany((type) => Tag, {eager: true})
    @JoinTable({name: 'report_tags'})
    public tags: Tag[];

    @Column({type: 'text', nullable: true})
    public reason: string;

    @Column({type: 'bigint', nullable: true}) @Index('guild', ['guildId'])
    public guildId?: string;

    @Column({type: 'simple-array'})
    public links: string[];

    @ManyToMany((type) => User, {eager: true})
    @JoinTable({name: 'reported_users'})
    public reportedUsers: User[];

    @OneToMany((type) => Confirmation, (confirmation) => confirmation.report, {eager: true})
    public confirmations: Confirmation[];

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();

    @Column({type: 'datetime'}) @Index('update_date', ['updateDate'])
    public updateDate: Date = new Date();
}
