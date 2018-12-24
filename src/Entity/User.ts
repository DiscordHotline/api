import {BaseEntity, Column, Entity, Index, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn, Table} from 'typeorm';
import Report from './Report';

@Entity('user')
export default class User extends BaseEntity {
    @Column({type: 'bigint'}) @Index('user_id', ['UserId'])
    @PrimaryColumn()
    public id: string;

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();

    constructor(id: string) {
        super();

        this.id = id;
    }
}
