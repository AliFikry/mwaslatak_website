const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Mock users data
const MOCK_USERS = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        totalTrips: 15,
        rating: 4.8,
        isActive: true,
        createdAt: new Date('2024-01-15')
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        totalTrips: 8,
        rating: 4.5,
        isActive: true,
        createdAt: new Date('2024-02-20')
    },
    {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1234567892',
        totalTrips: 23,
        rating: 4.9,
        isActive: false,
        createdAt: new Date('2024-01-10')
    },
    {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+1234567893',
        totalTrips: 12,
        rating: 4.7,
        isActive: true,
        createdAt: new Date('2024-03-05')
    },
    {
        id: '5',
        name: 'David Brown',
        email: 'david@example.com',
        phone: '+1234567894',
        totalTrips: 6,
        rating: 4.3,
        isActive: true,
        createdAt: new Date('2024-03-15')
    }
];

// Mock authentication middleware
const mockProtect = (req, res, next) => {
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

        // Mock admin data
        req.admin = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
};

// Dashboard stats (mock version)
router.get('/stats', mockProtect, async (req, res) => {
    try {
        const totalUsers = MOCK_USERS.length;
        const activeUsers = MOCK_USERS.filter(user => user.isActive).length;
        const totalTrips = MOCK_USERS.reduce((sum, user) => sum + user.totalTrips, 0);
        const recentUsers = MOCK_USERS
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalTrips,
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

// Get all users (mock version)
router.get('/users', mockProtect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = MOCK_USERS
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            count: users.length,
            total: MOCK_USERS.length,
            page,
            pages: Math.ceil(MOCK_USERS.length / limit),
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error fetching users'
        });
    }
});

// Get user by ID (mock version)
router.get('/users/:id', mockProtect, async (req, res) => {
    try {
        const user = MOCK_USERS.find(u => u.id === req.params.id);

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

// Search users (mock version)
router.get('/users/search/:query', mockProtect, async (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const users = MOCK_USERS.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.phone.includes(query)
        ).slice(0, 20);

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

module.exports = router;
