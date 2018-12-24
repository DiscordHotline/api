import {BaseEntity, Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import ReportCategoryEnum from '../ReportCategory';
import User from './User';

@Entity('tag')
export default class Tag extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: 'varchar', length: '32'})
    public name: string;

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();

    @Column({type: 'datetime'}) @Index('update_date', ['updateDate'])
    public updateDate: Date = new Date();
}
