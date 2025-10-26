const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Dashboard stats (admin only)
router.get('/stats', protect, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalTrips = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$totalTrips' } } }
        ]);

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt totalTrips rating');

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalTrips: totalTrips[0]?.total || 0,
                recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error fetching dashboard stats'
        });
    }
});

// Get all users (admin only)
router.get('/users', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v');

        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error fetching users'
        });
    }
});

// Get user by ID (admin only)
router.get('/users/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error fetching user'
        });
    }
});

// Update user (admin only)
router.put('/users/:id', protect, async (req, res) => {
    try {
        const { name, email, phone, isActive, rating } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, isActive, rating },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error updating user'
        });
    }
});

// Delete user (admin only)
router.delete('/users/:id', protect, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error deleting user'
        });
    }
});

// Search users (admin only)
router.get('/users/search/:query', protect, async (req, res) => {
    try {
        const query = req.params.query;
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        }).select('-__v').limit(20);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error searching users'
        });
    }
});

// Get users by location (admin only)
router.get('/users/location/nearby', protect, async (req, res) => {
    try {
        const { lat, lng, maxDistance = 10000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }

        const users = await User.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).select('-__v');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error fetching nearby users'
        });
    }
});

module.exports = router;
