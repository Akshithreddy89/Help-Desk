const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const normalizedRoles = roles.map((role) => role.toString().toLowerCase());
    const userRole = req.user.role?.toString().toLowerCase();

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
