// utils/permissions.js
export const checkPermission = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Access denied.' });
        }
        next();
    };
};