import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforantigravity123456789');
    req.user = await User.findById(decoded.id).populate('department');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'The user belonging to this token no longer exists.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired. Please log in again.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role (${req.user ? req.user.role : 'None'}) is not authorized to access this route. Required roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

export { protect, authorize };
