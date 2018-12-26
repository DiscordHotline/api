import {IsDefined, Length} from 'class-validator';
import AbstractModel from '../AbstractModel';

export default class Category extends AbstractModel<Category> {
    @IsDefined()
    @Length(3, 512)
    public name: string;
}
