import User from "../models/user.models.js";


export const checkRole1 = (roles) => (req, res, next) => {
    const userRole = req.user.role; // Assuming role is stored in the token payload

    if (!roles.includes(userRole)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
};

export const checkRole = (allowedRoles) => async (req, res, next) => {
    try {
      const userId = req.user.UserId; // Assuming userId is in token payload
      // Await the asynchronous function that retrieves the user's roles.
      const userRoles = await User.getUserRoles(userId);
      console.log('-------Usr rol : ', userRoles)
  
      // Check if at least one of the user's roles is in the allowed roles list.
      const hasPermission = userRoles.some(role => allowedRoles.includes(role));
  
      if (!hasPermission) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }
      next();
    } catch (error) {
      console.error('Error checking user roles:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };
  