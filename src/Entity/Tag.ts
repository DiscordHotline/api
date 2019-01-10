import {
    BaseEntity,
    Column,
    Entity,
    Index, JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import Category from './Category';

@Entity('tag')
export default class Tag {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: 'varchar', length: '32'})
    public name: string;

    @ManyToOne((type) => Category, (category) => category.tags)
    public category: Category;

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();

    @Column({type: 'datetime'}) @Index('update_date', ['updateDate'])
    public updateDate: Date = new Date();
}
