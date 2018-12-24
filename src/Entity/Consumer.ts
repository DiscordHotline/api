import {BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';

@Entity('consumer')
export default class Consumer extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column() @Index('name', ['name'])
    public name: string;

    @Column({type: 'text', nullable: true})
    public description: string;

    @Column() @Index('api_key', ['apiKey'])
    public apiKey: string;

    @Column()
    public permissions: number = 0;

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();
}
