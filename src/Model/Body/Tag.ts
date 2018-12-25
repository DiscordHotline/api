import {IsDefined, Length} from 'class-validator';
import AbstractModel from '../AbstractModel';

export default class Tag extends AbstractModel<Tag> {
    @IsDefined()
    @Length(3, 512)
    public name: string;
}
