import {ArrayMinSize, IsDefined, IsInt, IsOptional, Length} from 'class-validator';
import AbstractModel from '../AbstractModel';

type Snowflake = string;

export default class EditReport extends AbstractModel<EditReport> {
    @IsInt({each: true})
    @ArrayMinSize(1)
    public tags: number[];

    @IsDefined()
    @Length(10, 512)
    public reason: string;

    @Length(10, 512, {each: true})
    @IsOptional()
    public links: string[];

    @Length(15, 19)
    @IsOptional()
    public guildId: Snowflake;

    @IsDefined()
    @Length(15, 19, {each: true})
    @ArrayMinSize(1)
    public reportedUsers: Snowflake[];
}
