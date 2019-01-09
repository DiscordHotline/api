import {IsDefined, Length} from 'class-validator';
import AbstractModel from '../AbstractModel';

type Snowflake = string;

export default class ConfirmReport extends AbstractModel<ConfirmReport> {
    @IsDefined()
    @Length(15, 19)
    public guild: Snowflake;

    @IsDefined()
    @Length(15, 19)
    public user: Snowflake;

    @IsDefined()
    public confirmed: boolean;
}
