export const PERMISSIONS = {
    /**
     * Report related permissions
     */
    READ_REPORTS:   1 << 0,
    WRITE_REPORTS:  1 << 1,
    EDIT_REPORTS:   1 << 2,
    DELETE_REPORTS: 1 << 3,
    LIST_REPORTS:   1 << 4,

    /**
     * Consumer Related permissions
     */
    READ_CONSUMERS:   1 << 10,
    WRITE_CONSUMERS:  1 << 11,
    EDIT_CONSUMERS:   1 << 12,
    DELETE_CONSUMERS: 1 << 13,
    LIST_CONSUMERS:   1 << 14,

    /**
     * Tag Related permissions
     */
    READ_TAGS:   1 << 15,
    WRITE_TAGS:  1 << 16,
    EDIT_TAGS:   1 << 17,
    DELETE_TAGS: 1 << 18,
    LIST_TAGS:   1 << 19,

    /**
     * Category Related permissions
     */
    READ_CATEGORIES:   1 << 20,
    WRITE_CATEGORIES:  1 << 21,
    EDIT_CATEGORIES:   1 << 22,
    DELETE_CATEGORIES: 1 << 23,
    LIST_CATEGORIES:   1 << 24,

    /**
     * Subscription Related permissions
     */
    READ_SUBSCRIPTIONS:   1 << 25,
    WRITE_SUBSCRIPTIONS:  1 << 26,
    EDIT_SUBSCRIPTIONS:   1 << 27,
    DELETE_SUBSCRIPTIONS: 1 << 28,
    LIST_SUBSCRIPTIONS:   1 << 29,

    /**
     * Miscellaneous Perms
     */
    ADMINISTRATOR: 0, // Calculated Below
};

export const calculatePermissions = (...permissions) => {
    let perms = 0x0000000;
    for (const perm of permissions) {
        perms = (perms | perm);
    }

    return perms;
};

PERMISSIONS.ADMINISTRATOR = Object.values(PERMISSIONS).reduce((all, p) => all | p, 0);

export const hasPermission = (needle, haystack) => (haystack & needle) === needle;
