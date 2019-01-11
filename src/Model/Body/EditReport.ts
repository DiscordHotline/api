import {ArrayMinSize, IsDefined, IsInt, IsOptional, Length} from 'class-validator';
import AbstractModel from '../AbstractModel';

type Snowflake = string;

export default class EditReport extends AbstractModel<EditReport> {
    @IsOptional()
    @IsInt({each: true})
    public tags?: number[];

    @IsOptional()
    @Length(5, 512)
    public reason?: string;

    @IsOptional()
    @Length(10, 512, {each: true})
    public links?: string[];

    @IsOptional()
    @Length(15, 19)
    public guildId?: Snowflake;

    @IsOptional()
    @Length(15, 19, {each: true})
    @ArrayMinSize(1)
    public reportedUsers?: Snowflake[];
}
