import db from '../config/db.js';
class Role {
    static async create(role) {
        const [result] = await db.query(
            'INSERT INTO ROLES (ROLE_NAME, DESCRIPTION) VALUES (?, ?)',
            [role.roleName, role.description]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM ROLES WHERE ID = ?', [id]);
        return rows[0];
    }
    static async getUserRoles(userId) {
        try {
            const query = `
                    SELECT 
                        r.ID AS RoleId,
                        r.ROLE_NAME AS RoleName,
                        r.DESCRIPTION AS RoleDescription,
                        r.CREATED_AT AS RoleCreatedAt
                    FROM USERROLES ur
                    JOIN ROLES r ON ur.ROLE_ID = r.ID
                    WHERE ur.USER_ID = ?;
                `;

            const [rows] = await db.query(query, [userId]);

            if (rows.length === 0) {
                console.log(`No roles found for user ID: ${userId}`);
            }

            return rows; // Returns an array of roles
        } catch (error) {
            console.error("Database Error (getUserRoles):", error);
            throw new Error("Failed to fetch user roles");
        }
    }


    // Check if the user has one of the allowed roles
    static async hasRole(userId, allowedRoles) {
        try {
            // Ensure allowedRoles is an array.
            if (!Array.isArray(allowedRoles)) {
                allowedRoles = [allowedRoles];
            }
            const userRoles = await this.getUserRoles(userId);
            return allowedRoles.some(role => userRoles.includes(role));
        } catch (error) {
            console.error("Role Check Error:", error);
            throw new Error("Failed to check user roles");
        }
    }

    static async getUserPermissions(userId) {
        try {
            const query = `
                    SELECT p.PERMISSION_NAME
                    FROM USERPERMISSIONS up
                    JOIN PERMISSIONS p ON up.PERMISSION_ID = p.ID
                    WHERE up.USER_ID = ?;
                `;
            const [rows] = await db.query(query, [userId]);

            console.log("🔍 Raw Permission Query Result:", rows);

            return rows.map(row => row.PERMISSION_NAME); // Return as an array
        } catch (error) {
            console.error("Database Error:", error);
            throw new Error("Failed to fetch user permissions");
        }
    }

}
export default Role;