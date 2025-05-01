import { getRequiredPermissionsForRoute } from '../permissions.js';  // Import the permission map
import Role from '../../models/auth.models.js'

export const checkPermission = () => async (req, res, next) => {
    try {
        const userRole = req.user?.Role;  // Assuming the role is attached to the user object
        console.log("user", userRole)
        const userPermissions = req.user?.Permissions || [];

        if (!userRole) {
            return res.status(403).json({ error: "Access denied: User role not found =========." });
        }

        if (!userPermissions || userPermissions.length === 0) {
            return res.status(403).json({ error: "Access denied: User has no permissions." });
        }

        // Get the required permissions for the current route and user role
        const requiredPermissions = getRequiredPermissionsForRoute(req.originalUrl, userRole);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return res.status(403).json({ error: "Access denied: No required permissions defined for this route." });
        }

        // Check if the user has any of the required permissions
        const hasPermission = requiredPermissions.some(permission =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({ error: "Access denied: Insufficient permissions." });
        }

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error checking permissions:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const authenticateUser = async (req, res, next) => {
    try {
        const userId = req.user?.UserId; // Ensure we have userId
        // const userPermissions = req.user?.permissions || []; // Get permissions from req.user

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        // Fetch user roles
        const userRoles = await Role.getUserRoles(userId);
        if (!userRoles || userRoles.length === 0) {
            return res.status(401).json({ error: "Unauthorized: User has no roles" });
        }

        // Fetch user permissions
        const userPermissions = await Permission.getPermissionsByUserId(userId);
        if (!userPermissions || userPermissions.length === 0) {
            return res.status(401).json({ error: "Unauthorized: User has no permissions" });
        }

        // Attach roles and permissions to the request user object
        req.user.roles = userRoles; // Attach roles to req.user
        // req.user.role = userRoles[0] || 'user';  // Default to 'user' if no roles found
        req.user.permissions = userPermissions || []; // Attach permissions to req.user

        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


