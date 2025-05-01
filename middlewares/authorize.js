const authorize = (role) => (req, res, next) => {
    // Check if user has the required role
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
  
  export default authorize;