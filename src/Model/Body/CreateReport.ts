import {ArrayMinSize, IsDefined, IsInt, IsOptional, Length} from 'class-validator';
import Tag from '../../Entity/Tag';
import ReportCategoryEnum from '../../ReportCategory';
import AbstractModel from '../AbstractModel';

type Snowflake = string;

export default class CreateReport extends AbstractModel<CreateReport> {
    @IsDefined()
    @Length(16, 22)
    public reporter: Snowflake;

    @IsInt({each: true})
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
