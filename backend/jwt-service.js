const jwt = require('jsonwebtoken');

class JWTService {
  constructor() {
    // Load secret keys from environment variables
    this.secretKey = process.env.JWT_SECRET || 'fallback-secret-key';
    this.refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    
    // Token expiration times
    this.accessTokenExpiry = '15m'; // 15 minutes
    this.refreshTokenExpiry = '7d'; // 7 days
  }

  // Generate access token (short-lived)
  generateAccessToken(payload) {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'note-organizer-api'
    });
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecretKey, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'note-organizer-api'
    });
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecretKey);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Generate both tokens at once
  generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.username
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }
}

// Export a singleton instance
module.exports = new JWTService();