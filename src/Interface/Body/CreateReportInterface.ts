import ReportCategoryEnum from '../../ReportCategory';

type Snowflake = string;

export default interface CreateReportInterface {
    Reporter: Snowflake;
    Category: ReportCategoryEnum;
    Reason: string;
    GuildId: Snowflake;
    ReportedUsers: Snowflake[];
}
