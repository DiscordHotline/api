import {IsDefined, IsInt, IsOptional, Length} from 'class-validator';
import ReportCategoryEnum from '../../ReportCategory';
import AbstractModel from '../AbstractModel';

type Snowflake = string;

export default class CreateReport extends AbstractModel<CreateReport> {
    @IsDefined()
    @Length(16, 22)
    public Reporter: Snowflake;

    @IsDefined()
    @IsInt()
    public Category: ReportCategoryEnum;

    @IsDefined()
    @Length(10, 512)
    public Reason: string;

    @Length(10, 512, {each: true})
    @IsOptional()
    public Links: string[];

    @Length(15, 19)
    @IsOptional()
    public GuildId: Snowflake;

    @IsDefined()
    @Length(15, 19, {each: true})
    public ReportedUsers: Snowflake[];
}
