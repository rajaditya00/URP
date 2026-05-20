const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token.startsWith('mock-jwt-token-')) {
        // Dynamic mock user mapping for offline demo bypass tokens
        const rolePart = token.replace('mock-jwt-token-', '').toUpperCase();
        let matchedRole = 'PROFESSOR';
        if (rolePart === 'SUPER' || rolePart === 'SUPER_ADMIN') matchedRole = 'SUPER_ADMIN';
        else if (rolePart === 'SYSTEM' || rolePart === 'SYSTEM_ADMIN') matchedRole = 'SYSTEM_ADMIN';
        else if (rolePart === 'COLLEGE' || rolePart === 'COLLEGE_ADMIN') matchedRole = 'COLLEGE_ADMIN';
        else if (rolePart === 'STUDENT') matchedRole = 'STUDENT';

        // Check if there is any user in DB of this role to make it realistic, or mock it
        const dbUser = await User.findOne({ role: matchedRole });
        if (dbUser) {
          req.user = dbUser;
        } else {
          req.user = {
            id: '507f1f77bcf86cd799439011',
            name: 'Demo ' + matchedRole,
            email: matchedRole.toLowerCase() + '@cet.edu',
            role: matchedRole
          };
        }
        return next();
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretallcampusdigitalkey');
      req.user = await User.findById(decoded.user.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'None'} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };
