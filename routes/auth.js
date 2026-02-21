const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { userOps } = require('../database');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.SESSION_SECRET || 'agrieye-jwt-secret-change-in-production';
const JWT_EXPIRY = '30d'; // 30 days

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Google OAuth login/signup
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        // Development mode bypass
        if (credential === 'dev_mode_bypass') {
            console.log('⚠️  DEV MODE: Bypassing Google OAuth');
            let user = userOps.findByEmail('dev@agrieye.local');
            if (!user) {
                user = userOps.create({
                    googleId: 'dev_user_123',
                    email: 'dev@agrieye.local',
                    name: 'Development User',
                    profilePicture: null
                });
            }
            const token = generateToken(user.id);
            req.session.userId = user.id;
            req.session.save();
            return res.json({
                token,
                user: { id: user.id, email: user.email, name: user.name, profilePicture: user.profile_picture, location: user.location },
                isNewUser: false
            });
        }

        // Verify Google token - Support BOTH Firebase projects
        const validClientIds = [
            process.env.GOOGLE_CLIENT_ID,
            '1004415817502-clgpv9ge1jji650jvkestfg78rdnil0h.apps.googleusercontent.com'
        ];

        let ticket;
        let verificationError;

        for (const clientId of validClientIds) {
            try {
                const tempClient = new OAuth2Client(clientId);
                ticket = await tempClient.verifyIdToken({ idToken: credential, audience: clientId });
                console.log(`✅ Token verified with Client ID: ${clientId.substring(0, 20)}...`);
                break;
            } catch (err) {
                verificationError = err;
                console.log(`⚠️ Verification failed with ${clientId.substring(0, 20)}...: ${err.message}`);
            }
        }

        if (!ticket) throw verificationError || new Error('Token verification failed');

        const payload = ticket.getPayload();
        let user = userOps.findByGoogleId(payload['sub']);
        let isNewUser = false;

        if (!user) {
            user = userOps.create({
                googleId: payload['sub'],
                email: payload['email'],
                name: payload['name'],
                profilePicture: payload['picture']
            });
            isNewUser = true;
        }

        // Issue JWT (stateless - survives server restarts)
        const token = generateToken(user.id);

        // Also set session as fallback
        req.session.userId = user.id;
        req.session.save();

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                profilePicture: user.profile_picture,
                location: user.location
            },
            isNewUser
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Get current user - supports JWT (Authorization header) AND session cookie
router.get('/me', (req, res) => {
    try {
        // 1. Try JWT from Authorization header (primary - stateless)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = userOps.findById(decoded.userId);
                if (user) {
                    return res.json({
                        id: user.id, email: user.email, name: user.name,
                        profilePicture: user.profile_picture, location: user.location
                    });
                }
            } catch (jwtErr) {
                console.warn('[Auth] JWT verify failed:', jwtErr.message);
            }
        }

        // 2. Fallback: session cookie
        if (req.session && req.session.userId) {
            const user = userOps.findById(req.session.userId);
            if (user) {
                return res.json({
                    id: user.id, email: user.email, name: user.name,
                    profilePicture: user.profile_picture, location: user.location
                });
            }
            req.session.destroy();
        }

        return res.status(401).json({ error: 'Not authenticated' });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;