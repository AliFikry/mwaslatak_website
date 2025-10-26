const express = require('express');
const router = express.Router();
const { Admin } = require('../models/Admin');
const { protect, authorize } = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            });
        }

        // Check for admin
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Admin account is deactivated'
            });
        }

        // Check if account is locked
        if (admin.isLocked) {
            return res.status(401).json({
                success: false,
                error: 'Account is locked due to multiple failed login attempts. Please try again later.'
            });
        }

        // Check if password matches
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            // Increment login attempts
            await admin.incLoginAttempts();

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        await admin.resetLoginAttempts();

        // Create token
        const token = admin.generateAuthToken();

        // Set cookie options
        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.status(200)
            .cookie('token', token, options)
            .json({
                success: true,
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin
                }
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// Admin logout
router.post('/logout', (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // 10 seconds
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Admin logged out successfully'
    });
});

// Get current logged in admin
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        success: true,
        admin: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role,
            lastLogin: req.admin.lastLogin,
            createdAt: req.admin.createdAt
        }
    });
});

// Create new admin (super admin only)
router.post('/create', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { name, email, password, role = 'admin' } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, email, and password'
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                error: 'Admin with this email already exists'
            });
        }

        // Create admin
        const admin = await Admin.create({
            name,
            email,
            password,
            role
        });

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                createdAt: admin.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error creating admin'
        });
    }
});

// Get all admins (super admin only)
router.get('/admins', protect, authorize('super_admin'), async (req, res) => {
    try {
        const admins = await Admin.find().select('-password -__v');

        res.status(200).json({
            success: true,
            count: admins.length,
            data: admins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error fetching admins'
        });
    }
});

// Update admin (super admin only)
router.put('/admins/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;

        const admin = await Admin.findByIdAndUpdate(
            req.params.id,
            { name, email, role, isActive },
            { new: true, runValidators: true }
        ).select('-password -__v');

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error updating admin'
        });
    }
});

// Delete admin (super admin only)
router.delete('/admins/:id', protect, authorize('super_admin'), async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error deleting admin'
        });
    }
});

module.exports = router;
