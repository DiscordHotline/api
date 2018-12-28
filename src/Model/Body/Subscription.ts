import {ArrayMinSize, IsDefined, Length} from 'class-validator';
import {Column, Index} from 'typeorm';
import AbstractModel from '../AbstractModel';

export default class Subscription extends AbstractModel<Subscription> {
    @IsDefined()
    public consumer: number;

    @IsDefined()
    @ArrayMinSize(1)
    public tags: number[];
}
