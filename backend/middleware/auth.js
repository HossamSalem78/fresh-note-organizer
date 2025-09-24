const jwtService = require('../jwt-service');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);
    
    // Add user data to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };

    // Continue to next middleware/route
    next();

  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = { authenticateToken };