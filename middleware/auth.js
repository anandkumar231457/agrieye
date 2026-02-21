const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.SESSION_SECRET || 'agrieye-jwt-secret-change-in-production';

// Extract userId from JWT header or session
function getUserId(req) {
    // 1. Check Authorization: Bearer header (JWT - primary, cold-start safe)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(authHeader.substring(7), JWT_SECRET);
            return decoded.userId;
        } catch (e) { /* invalid token */ }
    }
    // 2. Fallback: session cookie
    return req.session && req.session.userId ? req.session.userId : null;
}

function requireAuth(req, res, next) {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

function attachUser(req, res, next) {
    const userId = getUserId(req);
    if (userId) {
        const { userOps } = require('../database');
        req.user = userOps.findById(userId);
    }
    next();
}

module.exports = { requireAuth, attachUser };
