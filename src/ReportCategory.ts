enum ReportCategoryEnum {
    SPAM = 1,
    ADVERTISING,
    BIGOTRY,
    ABUSE,
    TOS_VIOLATION,
    HARASSMENT,
    OTHER,
}

export const ReportCategories: Array<{ id: ReportCategoryEnum, display: string, description: string }> = [
    {
        id:          ReportCategoryEnum.SPAM,
        display:     'Spam',
        description: 'User(s) that are spamming',
    },
    {
        id:          ReportCategoryEnum.ADVERTISING,
        display:     'Advertising',
        description: 'User(s) sending unsolicited advertisements',
    },
    {
        id:          ReportCategoryEnum.BIGOTRY,
        display:     'Bigotry',
        description: 'User(s) displaying/participating in some form of bigotry',
    },
    {
        id:          ReportCategoryEnum.ABUSE,
        display:     'Abuse',
        description: 'User(s) that are abusing a system (like a bot). Note this is NOT a Discord T.o.S. violation.',
    },
    {
        id:          ReportCategoryEnum.TOS_VIOLATION,
        display:     'T.o.S. Violation',
        description: 'User(s) that are violating the Discord Terms of Service',
    },
    {
        id:          ReportCategoryEnum.HARASSMENT,
        display:     'Harassment',
        description: 'User(s) that are harassing other users',
    },
    {
        id:          ReportCategoryEnum.OTHER,
        display:     'Other',
        description: 'User(s) that are doing something outside of the other categories',
    },
];

export default ReportCategoryEnum;
