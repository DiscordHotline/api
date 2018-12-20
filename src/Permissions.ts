export const PERMISSIONS = {
    /**
     * Report related permissions
     */
    READ_REPORTS:   1,
    WRITE_REPORTS:  1 << 1,
    EDIT_REPORTS:   1 << 2,
    DELETE_REPORTS: 1 << 3,
    LIST_REPORTS:   1 << 4,

    /**
     * Consumer Related Permissions
     */
    READ_CONSUMERS:   1 << 10,
    WRITE_CONSUMERS:  1 << 11,
    EDIT_CONSUMERS:   1 << 12,
    DELETE_CONSUMERS: 1 << 13,
    LIST_CONSUMERS:   1 << 14,

    /**
     * Miscellaneous Perms
     */
    ADMINISTRATOR: 0 // Calculated Below
};

export const calculatePermissions = (...permissions) => {
    let perms = 0x00000000;
    for (const perm of permissions) {
        perms = (perms | perm);
    }

    return perms;
};

PERMISSIONS.ADMINISTRATOR = calculatePermissions(...Object.values(PERMISSIONS));

export const hasPermission = (needle, haystack) => (haystack & needle) === needle;
