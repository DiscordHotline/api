import {BaseEntity, Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import Subscription from './Subscription';

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

    @OneToMany((type) => Subscription, (subscription) => subscription.consumer)
    public subscriptions: Subscription[];

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();
}
