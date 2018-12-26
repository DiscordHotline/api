import {BaseEntity, Column, Entity, Index, JoinTable, OneToMany, PrimaryGeneratedColumn} from 'typeorm';

import Tag from './Tag';

@Entity('category')
export default class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({type: 'varchar', length: '32'})
    public name: string;

    @OneToMany((type) => Tag, (tag) => tag.category)
    public tags: Tag[];

    @Column({type: 'datetime'}) @Index('insert_date', ['insertDate'])
    public insertDate: Date = new Date();

    @Column({type: 'datetime'}) @Index('update_date', ['updateDate'])
    public updateDate: Date = new Date();
}
