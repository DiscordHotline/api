import {BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';

@Entity('Consumer')
export default class Consumer extends BaseEntity {
    @PrimaryGeneratedColumn()
    public Id: string;

    @Column() @Index('name', ['Name'])
    public Name: string;

    @Column({type: 'text', nullable: true})
    public Description: string;

    @Column() @Index('api_key', ['ApiKey'])
    public ApiKey: string;

    @Column()
    public Permissions: number = 0;

    @Column({type: 'datetime'}) @Index('insert_date', ['InsertDate'])
    public InsertDate: Date = new Date;
}
