const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { userOps } = require('../database');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login/signup
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        // Development mode bypass (REMOVE IN PRODUCTION!)
        if (credential === 'dev_mode_bypass') {
            console.log('⚠️  DEV MODE: Bypassing Google OAuth');

            // Check if dev user exists
            let user = userOps.findByEmail('dev@agrieye.local');
            let isNewUser = false;

            if (!user) {
                // Create dev user
                user = userOps.create({
                    googleId: 'dev_user_123',
                    email: 'dev@agrieye.local',
                    name: 'Development User',
                    profilePicture: null
                });
                isNewUser = true;
            }

            req.session.userId = user.id;
            req.session.save();

            return res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    profilePicture: user.profile_picture,
                    location: user.location
                },
                isNewUser
            });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const profilePicture = payload['picture'];

        // Check if user exists
        let user = userOps.findByGoogleId(googleId);
        let isNewUser = false;

        if (!user) {
            // Create new user
            user = userOps.create({
                googleId,
                email,
                name,
                profilePicture
            });
            isNewUser = true;
        }

        // Create session
        req.session.userId = user.id;
        req.session.save();

        res.json({
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

// Get current user
router.get('/me', (req, res) => {
    try {
        console.log(`[GET] /auth/me - Session ID: ${req.sessionID}, User ID: ${req.session?.userId}`);
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = userOps.findById(req.session.userId);
        if (!user) {
            // If user is not found in DB but session exists, clear session
            req.session.destroy();
            return res.status(401).json({ error: 'Session invalid - please login again' });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            profilePicture: user.profile_picture,
            location: user.location
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error while fetching user' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;
