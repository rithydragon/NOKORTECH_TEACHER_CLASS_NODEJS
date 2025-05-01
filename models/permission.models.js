// import db from "../config/db.js";

// export default class Permission {
//     static async getPermissionsByRole(roleId) {
//         const [rows] = await db.execute(`
//             SELECT p.name FROM permissions p
//             JOIN role_permissions rp ON p.id = rp.permission_id
//             WHERE rp.role_id = ?`, [roleId]);
//         return rows.map(p => p.name);
//     }
// }

import db from "../config/db.js";

class Permission {
    /**
     * Get all permissions for a specific role.
     * @param {number} roleId - The role ID.
     * @returns {Array} - List of permission names.
     */
    static async getPermissionsByRole(roleId) {
        const [permissions] = await db.execute(
            `SELECT p.name FROM permissions p 
             JOIN role_permissions rp ON p.id = rp.permission_id 
             WHERE rp.role_id = ?`, 
            [roleId]
        );
        return permissions.map((p) => p.name);
    }

    
    static async getPermissionsByUserId(userId) {
        try {
            const query = `
                SELECT 
                    U.ID AS UserId,
                    U.USER_CODE AS UserCode,
                    U.NAME AS Name,
                    U.NAME_ENGLISH AS NameEnglish,
                    U.USERNAME AS Username,
                    U.EMAIL AS Email,
                    U.PASSWORD AS Password,
                    U.GENDER AS Gender,
                    U.USER_TYPE AS UserType,
                    U.DOB AS DateOfBirth,
                    U.POB AS PlaceOfBirth,
                    U.ADDRESS AS Address,
                    U.PHONE_NUMBER AS PhoneNumber,
                    U.LOGON_STATUS AS LogonStatus,
                    U.IS_ACTIVE AS IsActive,
                    U.LAST_LOGIN AS LastLogin,
                    U.CREATED_BY AS CreatedBy,
                    U.CREATED_AT AS CreatedAt,
                    U.UPDATED_BY AS UpdatedBy,
                    U.UPDATED_AT AS UpdatedAt,
                    P.ID AS PermissionId,
                    P.PERMISSION_NAME AS PermissionName,
                    P.DESCRIPTION AS PermissionDescription,
                    P.MODULE_NAME AS ModuleName,
                    P.CREATED_AT AS PermissionCreatedAt
                FROM USERS U
                JOIN USERROLES UR ON U.ID = UR.USER_ID
                JOIN ROLES R ON UR.ROLE_ID = R.ID
                JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                WHERE U.ID = ?;
            `;
            const [rows] = await db.query(query, [userId]);

            const permission = rows.map(row => row.PermissionName)

            console.log("🔍 Raw Permission Query Result === -----:", permission);

            return rows.map(row => row.PermissionName); // Return as an array
        } catch (error) {
            console.error("Database Error:", error);
            throw new Error("Failed to fetch user permissions");
        }
    }
}

export default Permission;