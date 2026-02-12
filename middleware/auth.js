// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Attach user to request
function attachUser(req, res, next) {
    if (req.session && req.session.userId) {
        const { userOps } = require('../database');
        req.user = userOps.findById(req.session.userId);
    }
    next();
}

module.exports = {
    requireAuth,
    attachUser
};
