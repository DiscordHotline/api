import {BaseEntity, Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import ReportCategoryEnum from '../ReportCategory';
import User from './User';



@Entity('Report')
export default class Report extends BaseEntity {
    @PrimaryGeneratedColumn()
    public Id: number;

    @ManyToOne(type => User)
    @JoinTable()
    public Reporter: User;

    @Column() @Index('category', ['Category'])
    public Category: ReportCategoryEnum;

    @Column({type: 'text'})
    public Reason: string;

    @Column({type: 'bigint'}) @Index('guild', ['GuildId'])
    public GuildId?: string;

    @Column({type: 'simple-array'})
    public MessageIds: string[] = [];

    @Column({type: 'simple-array'})
    public Links: string[];

    @ManyToMany(type => User)
    @JoinTable()
    public ReportedUsers: User[];

    @ManyToMany(type => User)
    @JoinTable()
    public ConfirmationUsers: User[];

    @Column({type: 'datetime'}) @Index('insert_date', ['InsertDate'])
    public InsertDate: Date = new Date;

    @Column({type: 'datetime'}) @Index('update_date', ['UpdateDate'])
    public UpdateDate: Date = new Date;
}
