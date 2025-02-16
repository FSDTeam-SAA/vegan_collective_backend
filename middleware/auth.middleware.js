// middleware/auth.middleware.js

const jwt = require('jsonwebtoken'); // You need to install jsonwebtoken: npm install jsonwebtoken

// Secret key for signing the JWT (you should store this in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach the user information to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // If the token is invalid or expired
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authenticateToken;