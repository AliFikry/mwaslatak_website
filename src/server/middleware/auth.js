const jwt = require('jsonwebtoken');
const { Admin } = require('../models/Admin');
const { User } = require('../models/User');

// Protect routes - verify JWT token (Admin only)
const protect = async (req, res, next) => {
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

        // Make sure token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

            // Get admin from token
            const admin = await Admin.findById(decoded.id).select('+password');

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    error: 'No admin found with this token'
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
                    error: 'Admin account is locked due to multiple failed login attempts'
                });
            }

            req.admin = admin;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error in authentication'
        });
    }
};

// Protect routes - verify JWT token (User only)
const protectUser = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check for token in cookies
        if (!token && req.cookies.userToken) {
            token = req.cookies.userToken;
        }

        // Make sure token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

            // Get user from token
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'No user found with this token'
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
                    error: 'User account is locked due to multiple failed login attempts'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error in authentication'
        });
    }
};

// Protect routes - verify JWT token (Admin OR User)
const protectAny = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check for admin token in cookies
        if (!token && req.cookies.token) {
            token = req.cookies.token;
        }

        // Check for user token in cookies
        if (!token && req.cookies.userToken) {
            token = req.cookies.userToken;
        }

        // Make sure token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

            // Try to get admin first
            const admin = await Admin.findById(decoded.id);
            if (admin && admin.isActive && !admin.isLocked) {
                req.admin = admin;
                req.userType = 'admin';
                return next();
            }

            // Try to get user
            const user = await User.findById(decoded.id);
            if (user && user.isActive && !user.isLocked) {
                req.user = user;
                req.userType = 'user';
                return next();
            }

            return res.status(401).json({
                success: false,
                error: 'No valid user found with this token'
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error in authentication'
        });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                error: `Admin role ${req.admin.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
                const admin = await Admin.findById(decoded.id);

                if (admin && admin.isActive && !admin.isLocked) {
                    req.admin = admin;
                }
            } catch (error) {
                // Token is invalid, but we continue without admin
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    protect,        // Admin only
    protectUser,    // User only
    protectAny,     // Admin OR User
    authorize,
    optionalAuth
};
