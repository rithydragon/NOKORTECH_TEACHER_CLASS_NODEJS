import pool from "../config/db.js";
import Permission from "../models/permission.models.js";

/**
 * Middleware to check if the user has the required permission.
 * @param {string} requiredPermission - The permission required to access the route.
 * @returns {Function} - Middleware function.
 */
export const checkPermission = (requiredPermission) => async (req, res, next) => {
    try {
        const userId = req.user.id; // Get logged-in user ID from the token

        // Get the user's role ID
        const [userRole] = await pool.execute("SELECT role_id FROM users WHERE id = ?", [userId]);
        if (userRole.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const roleId = userRole[0].role_id;

        // Fetch permissions for this role
        const [permissions] = await pool.execute(
            `SELECT p.name FROM permissions p 
             JOIN role_permissions rp ON p.id = rp.permission_id 
             WHERE rp.role_id = ?`, 
            [roleId]
        );

        // Extract permission names
        const userPermissions = permissions.map((p) => p.name);

        // Check if the user has the required permission
        if (!userPermissions.includes(requiredPermission)) {
            return res.status(403).json({ message: "Access denied. Insufficient permission." });
        }

        next(); // User has permission, proceed to the next middleware
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Alternative permission middleware using the Permission model.
 * @param {string} requiredPermission - The permission required to access the route.
 * @returns {Function} - Middleware function.
 */
export const checkPermissionq = (requiredPermission) => async (req, res, next) => {
    try {
        const roleId = req.user.role_id; // Get role ID from the token

        // Fetch permissions for this role using the Permission model
        const permissions = await Permission.getPermissionsByRole(roleId);

        // Check if the user has the required permission
        if (!permissions.includes(requiredPermission)) {
            return res.status(403).json({ message: "Access denied. Insufficient permission." });
        }

        next(); // User has permission, proceed to the next middleware
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};