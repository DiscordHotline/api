import {BaseEntity, Column, Entity, Index, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn, Table} from 'typeorm';
import Report from './Report';

@Entity('User')
export default class User extends BaseEntity {
    @Column({type: 'bigint'}) @Index('user_id', ['UserId'])
    @PrimaryColumn()
    public Id: string;

    @Column({type: 'datetime'}) @Index('insert_date', ['InsertDate'])
    public InsertDate: Date = new Date;

    constructor(id: string) {
        super();

        this.Id = id;
    }
}
