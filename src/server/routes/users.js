const express = require('express');
const multer = require('multer');
const router = express.Router();
const { User } = require('../models/User');
const { protectUser } = require('../middleware/auth');

// Configure multer for handling multipart/form-data
const upload = multer();

// Add form data support specifically for this router
router.use(express.urlencoded({ extended: true }));
router.use(upload.none()); // Handle multipart/form-data without file uploads

// User registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, email, and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Create user
        const userData = { name, email, password };
        if (phone && phone.trim()) {
            userData.phone = phone;
        }
        const user = await User.create(userData);


        // Generate token
        const token = user.generateAuthToken();

        // Set cookie options
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.status(201)
            .cookie('userToken', token, options)
            .json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    createdAt: user.createdAt
                }
            });
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during registration',
            details: error.message
        });
    }
});

// User login (GET with query params)
router.get('/login', async (req, res) => {
    try {
        const { email, password } = req.query;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'User account is deactivated'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(401).json({
                success: false,
                error: 'Account is locked due to multiple failed login attempts. Please try again later.'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // Increment login attempts
            await user.incLoginAttempts();

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Create token
        const token = user.generateAuthToken();

        // Set cookie options
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.status(200)
            .cookie('userToken', token, options)
            .json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    lastLogin: user.lastLogin
                }
            });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// User login (POST with body)
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

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'User account is deactivated'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(401).json({
                success: false,
                error: 'User account is locked due to multiple failed login attempts. Please try again later.'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // Increment login attempts
            await user.incLoginAttempts();

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Generate token
        const token = user.generateAuthToken();

        // Set cookie options
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.status(200)
            .cookie('userToken', token, options)
            .json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    lastLogin: user.lastLogin
                }
            });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login'
        });
    }
});

// User logout
router.post('/logout', (req, res) => {
    res.cookie('userToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // 10 seconds
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
});

// Get current logged in user
router.get('/me', protectUser, (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone,
            lastLogin: req.user.lastLogin,
            createdAt: req.user.createdAt,
            preferences: req.user.preferences
        }
    });
});

// Update user profile
router.put('/profile', protectUser, async (req, res) => {
    try {
        const { name, phone, preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, preferences },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                preferences: user.preferences
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating profile'
        });
    }
});

// Change password
router.put('/change-password', protectUser, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Please provide current password and new password'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error changing password'
        });
    }
});

// Get metro network data for users
router.get('/metro-network', async (req, res) => {
    try {
        console.log('User metro network API called');

        const Station = require('../models/Station');
        const Route = require('../models/Route');

        // Get all metro stations
        const stations = await Station.find({
            stationType: 'metro',
            isActive: true
        }).select('name stationType location description facilities createdAt');

        // Get all metro routes with populated stations
        const routes = await Route.find({
            transportType: 'metro',
            isActive: true
        })
            .populate('stations', 'name stationType location')
            .select('name description transportType stations path distance pricing createdAt')
            .sort({ createdAt: -1 });

        // Create simplified station data for users
        const stationData = stations.map(station => ({
            id: station._id,
            name: station.name,
            location: {
                lat: station.location.lat,
                lng: station.location.lng
            },
            description: station.description,
            facilities: station.facilities,
            createdAt: station.createdAt
        }));

        // Create simplified route data for users
        const routeData = routes.map(route => ({
            id: route._id,
            name: route.name,
            description: route.description,
            distance: route.distance,
            pricing: route.pricing,
            stationCount: route.stations.length,
            stations: route.stations.map(station => ({
                id: station._id,
                name: station.name,
                location: {
                    lat: station.location.lat,
                    lng: station.location.lng
                }
            })),
            path: route.path,
            createdAt: route.createdAt
        }));

        // Calculate basic statistics
        const totalStations = stations.length;
        const totalRoutes = routes.length;
        const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);

        const networkData = {
            metadata: {
                totalStations,
                totalRoutes,
                totalDistance: Math.round(totalDistance * 100) / 100,
                lastUpdated: new Date().toISOString()
            },
            stations: stationData,
            routes: routeData,
            statistics: {
                averageStationsPerRoute: totalRoutes > 0 ? Math.round((routes.reduce((sum, route) => sum + route.stations.length, 0) / totalRoutes) * 100) / 100 : 0,
                averageRouteLength: totalRoutes > 0 ? Math.round((routes.reduce((sum, route) => sum + route.distance, 0) / totalRoutes) * 100) / 100 : 0
            }
        };

        res.json({
            success: true,
            data: networkData
        });
    } catch (error) {
        console.error('Error fetching user metro network data:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
