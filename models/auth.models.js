import db from '../config/db.js';

class AuthsModel {
    static async getUsersByPermission(permissionName) {
        const query = `
                SELECT DISTINCT U.ID, U.USERNAME, U.EMAIL, U.NAME, P.PERMISSION_NAME
                FROM USERS U
                JOIN USERROLES UR ON U.ID = UR.USER_ID
                JOIN ROLES R ON UR.ROLE_ID = R.ID
                JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                WHERE P.PERMISSION_NAME = ?
            `;
        const [users] = await db.query(query, [permissionName]);
        return users;
    }

    static async getUserRoles(userId) {
        const query = `
                SELECT r.ROLE_NAME
                FROM USERS u
                JOIN USERROLES ur ON u.ID = ur.USER_ID
                JOIN ROLES r ON ur.ROLE_ID = r.ID
                WHERE u.ID = ?;
            `;
        const [rows] = await db.query(query, [userId]);
        return rows.map(row => row.ROLE_NAME);
    }

    static async getUsersByRole(roleName) {
        const query = `
                SELECT U.ID, U.USERNAME, U.EMAIL, U.NAME, R.ROLE_NAME
                FROM USERS U
                JOIN USERROLES UR ON U.ID = UR.USER_ID
                JOIN ROLES R ON UR.ROLE_ID = R.ID
                WHERE R.ROLE_NAME = ?
            `;
        const [users] = await db.query(query, [roleName]);
        return users;
    }

    static async userWithRolePermission(userId, permissionId, allowedRoles) {
        try {
            const userRoles = await this.getUsersByRole(userId);
            const userPermissions = await this.getUsersByPermission(permissionId);
            return allowedRoles.some(role => userRoles.includes(role));
        } catch (error) {
            console.error("Role Check Error:", error);
            throw new Error("Failed to check user roles");
        }
    }

    static checkUserRolePermission = async (userId, roleName, permissionName) => {
        try {
            // const { userId, roleName, permissionName } = req.params; // Get params

            // Query database to check role and permission
            const [result] = await db.query(`
                SELECT 
                    U.ID AS UserID, U.USERNAME, U.EMAIL, 
                    R.ROLE_NAME, P.PERMISSION_NAME
                    FROM USERS U
                    JOIN USERROLES UR ON U.ID = UR.USER_ID
                    JOIN ROLES R ON UR.ROLE_ID = R.ID
                    JOIN ROLEPERMISSIONS RP ON R.ID = RP.ROLE_ID
                    JOIN PERMISSIONS P ON RP.PERMISSION_ID = P.ID
                    WHERE U.ID = ? AND R.ROLE_NAME = ? AND P.PERMISSION_NAME = ?;
            `, [userId, roleName, permissionName]);

            if (result.length > 0) {
                return res.json({ message: "User has the required role and permission", data: result });
            } else {
                return res.status(403).json({ message: "User does not have the required role or permission" });
            }

        } catch (error) {
            console.error("Error checking user role & permission:", error);
            return res.status(500).json({ message: "Server error" });
        }
    }

    static async createOrUpdateRefreshToken(userId, refreshToken) {
        // First check if an auth record exists for this user
        const [existingAuth] = await db.execute(
            'SELECT * FROM AUTHS WHERE USER_ID = ?',
            [userId]
        );

        if (existingAuth.length > 0) {
            // Update existing record
            const [result] = await db.execute(
                `UPDATE AUTHS 
                 SET REFRESH_TOKEN = ?, 
                     UPDATED_AT = CURRENT_TIMESTAMP 
                 WHERE USER_ID = ?`,
                [refreshToken, userId]
            );
            return result;
        } else {
            // Create new record
            const [result] = await db.execute(
                `INSERT INTO AUTHS 
                 (USER_ID, REFRESH_TOKEN) 
                 VALUES (?, ?)`,
                [userId, refreshToken]
            );
            return result;
        }
    }

    static async findByUserId(userId) {
        const [rows] = await db.execute(
            'SELECT * FROM AUTHS WHERE USER_ID = ?',
            [userId]
        );
        return rows[0];
    }

    static async deleteRefreshToken(userId) {
        const [result] = await db.execute(
            'UPDATE AUTHS SET REFRESH_TOKEN = NULL WHERE USER_ID = ?',
            [userId]
        );
        return result;
    }

    static async updateLastLogin(userId) {
        const [result] = await db.execute(
            `UPDATE USERS 
             SET LAST_LOGIN = CURRENT_TIMESTAMP, 
                 LOGON_STATUS = TRUE 
             WHERE ID = ?`,
            [userId]
        );
        return result;
    }

    static loginStatus = async (userId) => {
        console.log("User id in auth model  loginStatus- AUTHS ", userId)

        let query = `UPDATE USERS 
               SET LOGON_STATUS = FALSE,
                   UPDATED_AT = CURRENT_TIMESTAMP
               WHERE ID = ?`
        const [result] = await db.execute(query, [userId]);
        return result;
    }

    static async invalidateRefreshToken(userId) {
        console.log("User id in auth model AUTHS  - invalidateRefreshToken  ", userId)
        const [result] = await db.execute(
            `UPDATE AUTHS 
             SET REFRESH_TOKEN = NULL,
                 ACCESS_TOKEN = NULL,
                 UPDATED_AT = CURRENT_TIMESTAMP
             WHERE USER_ID = ?`,
            [userId]
        );
        return result;
    }

    static async updateRefreshToken(refreshToken, userId) {
        try {
            const [result] = await db.execute(
                'UPDATE USERS SET REFRESHTOKEN = ? WHERE ID = ?',
                [refreshToken, userId]
            );
            return result;
        } catch (error) {
            console.log("Error : ", error)
        }
    }

    static async findByRefreshToken(refreshToken, userId) {
        try {
            const query = `
            SELECT 
                ID AS Id, 
                USER_ID AS UserId,
                DEVICE_ID AS DeviceId,
                REFRESH_TOKEN AS RefreshToken,
                ACCESS_TOKEN AS AccessToken,
                TOKEN_EXPIRES_AT AS TokenExpiresAt,
                RESET_TOKEN AS ResetToken,
                RESET_TOKEN_EXPIRES AS ResetTokenExpires,
                FAILED_LOGIN_ATTEMPTS AS FailedLoginAttempts,
                LAST_LOGIN_AT AS LastLoginAt,
                ACCOUNT_LOCKED_UNTIL AS AccountLockedUntil,
                LAST_REFRESH AS LastRefresh,
                CREATED_AT AS CreatedAt,
                UPDATED_AT AS UpdatedAt
            FROM 
                AUTHS
            WHERE 
                REFRESH_TOKEN = ?;
            `
            const [result] = await db.execute(query,
                [refreshToken]
            );
            return result;
        } catch (error) {
            console.log("Error : ", error)
        }
    }
    static asyncUpdateRefreshToken = async ( newRefreshToken,expires,userId) => {
        if (!userId || !newRefreshToken) {
            throw new Error('Missing userId or refresh token');
        }

        const query = `
          UPDATE AUTHS SET 
            REFRESH_TOKEN = ?, 
            REFRESH_TOKEN_EXPIRES = ?,
            UPDATED_AT = CURRENT_TIMESTAMP(), 
            LAST_REFRESH = CURRENT_TIMESTAMP() 
          WHERE USER_ID = ?
        `;

        return db.execute(query, [newRefreshToken,expires, userId]);
    };
}

export default AuthsModel;
// SELECT * FROM AUTHS WHERE REFRESH_TOKEN = ? AND REFRESH_TOKEN_EXPIRES > NOW()
