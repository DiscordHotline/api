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

import Consumer from './Consumer';
import Tag from './Tag';

@Entity('subscription')
export default class Subscription extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type) => Consumer, (consumer) => consumer.subscriptions)
    public consumer: Consumer;

    @ManyToMany((type) => Tag)
    @JoinTable({name: 'subscription_tags'})
    public tags: Tag[];
}
