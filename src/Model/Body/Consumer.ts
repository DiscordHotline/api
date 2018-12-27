import {IsDefined, Length} from 'class-validator';
import {Column, Index} from 'typeorm';
import AbstractModel from '../AbstractModel';

export default class Category extends AbstractModel<Category> {
    @IsDefined()
    @Length(3, 512)
    public name: string;

    @IsDefined()
    @Length(3, 512)
    public description: string;

    @IsDefined()
    public permissions: number = 0;
}
