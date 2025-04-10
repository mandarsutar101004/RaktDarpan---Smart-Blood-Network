const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // 1. Ensure user exists (must be used after authenticateJWT)
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // 2. Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of these roles: ${allowedRoles.join(
          ", "
        )}`,
        yourRole: req.user.role, // For debugging
      });
    }

    next();
  };
};

module.exports = checkRole;
