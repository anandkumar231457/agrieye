const express = require('express');
const { userOps, cropOps } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get user profile
router.get('/profile', (req, res) => {
    try {
        console.log(`[GET /api/user/profile] User ID: ${req.session.userId}`);

        const user = userOps.findById(req.session.userId);
        if (!user) {
            console.error(`[GET /api/user/profile] User not found: ${req.session.userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        const crops = cropOps.getUserCrops(req.session.userId);

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            profilePicture: user.profile_picture,
            location: user.location,
            field_location: user.field_location,
            crops: crops.map(c => ({ id: c.id, type: c.crop_type }))
        });
    } catch (error) {
        console.error('[GET /api/user/profile] Error:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            error: 'Failed to load profile',
            details: error.message
        });
    }
});

// Update user profile
router.put('/profile', (req, res) => {
    try {
        console.log(`[PUT /api/user/profile] User ID: ${req.session.userId}`);
        console.log('[PUT /api/user/profile] Request body:', JSON.stringify(req.body));

        const { name, location, field_location } = req.body;

        // Validate input
        if (name !== undefined && typeof name !== 'string') {
            return res.status(400).json({ error: 'Invalid name format' });
        }
        if (location !== undefined && typeof location !== 'string') {
            return res.status(400).json({ error: 'Invalid location format' });
        }
        if (field_location !== undefined && typeof field_location !== 'string') {
            return res.status(400).json({ error: 'Invalid field_location format' });
        }

        console.log('[PUT /api/user/profile] Updating user...');
        const updatedUser = userOps.update(req.session.userId, { name, location, field_location });

        if (!updatedUser) {
            console.error(`[PUT /api/user/profile] Update failed - user not found: ${req.session.userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('[PUT /api/user/profile] Update successful');
        res.json({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            profilePicture: updatedUser.profile_picture,
            location: updatedUser.location,
            field_location: updatedUser.field_location
        });
    } catch (error) {
        console.error('[PUT /api/user/profile] Error:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            error: 'Failed to update profile',
            details: error.message
        });
    }
});

// Complete onboarding
router.post('/onboarding', (req, res) => {
    try {
        console.log(`[POST /api/user/onboarding] User ID: ${req.session.userId}`);
        const { crops, location } = req.body;

        // Update location
        userOps.update(req.session.userId, { location });

        // Set crops
        if (crops && crops.length > 0) {
            cropOps.setCrops(req.session.userId, crops);
        }

        const user = userOps.findById(req.session.userId);
        const userCrops = cropOps.getUserCrops(req.session.userId);

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            profilePicture: user.profile_picture,
            location: user.location,
            crops: userCrops.map(c => ({ id: c.id, type: c.crop_type }))
        });
    } catch (error) {
        console.error('[POST /api/user/onboarding] Error:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            error: 'Failed to complete onboarding',
            details: error.message
        });
    }
});

// Add crop
router.post('/crops', (req, res) => {
    try {
        console.log(`[POST /api/user/crops] User ID: ${req.session.userId}`);
        const { cropType } = req.body;

        if (!cropType) {
            return res.status(400).json({ error: 'Crop type is required' });
        }

        const crop = cropOps.addCrop(req.session.userId, cropType);

        res.json({ id: crop.id, type: crop.crop_type });
    } catch (error) {
        console.error('[POST /api/user/crops] Error:', error);
        res.status(500).json({
            error: 'Failed to add crop',
            details: error.message
        });
    }
});

// Remove crop
router.delete('/crops/:cropId', (req, res) => {
    try {
        console.log(`[DELETE /api/user/crops/${req.params.cropId}] User ID: ${req.session.userId}`);
        const { cropId } = req.params;

        if (!cropId || isNaN(parseInt(cropId))) {
            return res.status(400).json({ error: 'Invalid crop ID' });
        }

        cropOps.removeCrop(parseInt(cropId), req.session.userId);

        res.json({ message: 'Crop removed successfully' });
    } catch (error) {
        console.error('[DELETE /api/user/crops] Error:', error);
        res.status(500).json({
            error: 'Failed to remove crop',
            details: error.message
        });
    }
});

module.exports = router;
