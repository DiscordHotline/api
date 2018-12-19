import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    Table,
} from 'typeorm';
import ReportCategoryEnum from '../ReportCategory';
import ConfirmationUser from './ConfirmationUser';
import ReportedUser from './ReportedUser';

enum Category {

}

@Entity('Report')
export default class Report extends BaseEntity {
    @PrimaryGeneratedColumn()
    public Id: number;

    @Column({type: 'bigint'}) @Index('reporter', ['Reporter'])
    public Reporter: string;

    @Column() @Index('category', ['Category'])
    public Category: ReportCategoryEnum;

    @Column({type: 'text'})
    public Reason: string;

    @Column({type: 'bigint'}) @Index('guild', ['GuildId'])
    public GuildId?: string;

    @Column({type: 'simple-array'})
    public messageIds: string[] = [];

    @ManyToMany(type => ReportedUser, reportedUser => reportedUser.Reports)
    @JoinColumn()
    public ReportedUsers: ReportedUser[] = [];

    @ManyToMany(type => ConfirmationUser, confirmationUser => confirmationUser.Reports)
    @JoinColumn()
    public ConfirmationUsers: ConfirmationUser[] = [];

    @Column({type: 'datetime'}) @Index('insert_date', ['InsertDate'])
    public InsertDate: Date = new Date;

    @Column({type: 'datetime'}) @Index('update_date', ['UpdateDate'])
    public UpdateDate: Date = new Date;
}
