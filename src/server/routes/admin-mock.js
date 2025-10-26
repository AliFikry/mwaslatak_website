const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Mock admin credentials (in production, these would be in the database)
const MOCK_ADMINS = [
    {
        id: '1',
        name: 'Super Admin',
        email: 'admin@mwaslatak.com',
        password: 'admin123', // In production, this would be hashed
        role: 'super_admin'
    },
    {
        id: '2',
        name: 'Regular Admin',
        email: 'admin2@mwaslatak.com',
        password: 'admin456',
        role: 'admin'
    }
];

// Admin login (mock version)
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

        // Find admin in mock data
        const admin = MOCK_ADMINS.find(a => a.email === email && a.password === password);

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Create token
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

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
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
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
router.get('/me', (req, res) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check for token in cookies
        if (!token && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

        // Find admin
        const admin = MOCK_ADMINS.find(a => a.id === decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'No admin found with this token'
            });
        }

        res.status(200).json({
            success: true,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
});

// Get admin credentials info
router.get('/credentials', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin credentials for testing',
        credentials: MOCK_ADMINS.map(admin => ({
            name: admin.name,
            email: admin.email,
            password: admin.password,
            role: admin.role
        }))
    });
});

module.exports = router;
