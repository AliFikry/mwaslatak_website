const express = require('express');
const path = require('path');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Import route modules
const apiRoutes = require('./api');
const adminRoutes = require('./admin');
const userRoutes = require('./users');
const dashboardRoutes = require('./dashboard');
const stationsApi = require('./stations');
const routesApi = require('./routes');

// Mock authentication middleware for all routes
const protectAllRoutes = (req, res, next) => {
    // Allow access to admin page, maps page, static assets, public APIs, and user pages without token
    if (req.path === '/admin' ||
        req.path === '/maps' ||
        req.path === '/register' ||
        req.path === '/login' ||
        req.path.startsWith('/css/') ||
        req.path.startsWith('/js/') ||
        req.path.startsWith('/assets/') ||
        req.path === '/health' ||
        req.path.startsWith('/admin/login') ||
        req.path.startsWith('/admin/logout') ||
        req.path.startsWith('/admin/credentials') ||
        req.path === '/api/routes/metro-network' ||
        req.path.startsWith('/api/users/register') ||
        req.path.startsWith('/api/users/login') ||
        req.path === '/api/users/metro-network') {
        return next();
    }

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

        // Make sure token exists for all other routes
        if (!token) {
            // Always redirect to admin page for web requests
            if (req.headers.accept && req.headers.accept.includes('text/html')) {
                return res.redirect(302, '/admin');
            }
            // Return JSON error for API requests
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route',
                redirect: '/admin'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

            // Check if token is expired
            if (decoded.exp * 1000 <= Date.now()) {
                // Token expired - redirect to admin
                if (req.headers.accept && req.headers.accept.includes('text/html')) {
                    return res.redirect(302, '/admin');
                }
                return res.status(401).json({
                    success: false,
                    error: 'Token expired',
                    redirect: '/admin'
                });
            }

            // Mock admin data
            req.admin = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };

            next();
        } catch (error) {
            // Invalid token - redirect to admin
            if (req.headers.accept && req.headers.accept.includes('text/html')) {
                return res.redirect(302, '/admin');
            }
            // Return JSON error for API requests
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                redirect: '/admin'
            });
        }
    } catch (error) {
        // Server error - redirect to admin
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return res.redirect(302, '/admin');
        }
        // Return JSON error for API requests
        return res.status(500).json({
            success: false,
            error: 'Server error in authentication',
            redirect: '/admin'
        });
    }
};

// Mount API routes first (they handle their own authentication)
router.use('/api/users', userRoutes);
router.use('/api', apiRoutes);
router.use('/api/stations', stationsApi);
router.use('/api/routes', routesApi);

// Health check route (public)
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Mwaslatak Transportation App'
    });
});

// Public metro network API (no authentication required)
router.get('/api/public/metro-network', async (req, res) => {
    try {
        console.log('Public metro network API called');

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

        // Create station connections map
        const stationConnections = {};
        const routeConnections = [];

        routes.forEach(route => {
            const routeData = {
                id: route._id,
                name: route.name,
                description: route.description,
                distance: route.distance,
                pricing: route.pricing,
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
            };

            routeConnections.push(routeData);

            // Build station connections
            route.stations.forEach((station, index) => {
                const stationId = station._id.toString();

                if (!stationConnections[stationId]) {
                    stationConnections[stationId] = {
                        station: {
                            id: station._id,
                            name: station.name,
                            location: {
                                lat: station.location.lat,
                                lng: station.location.lng
                            }
                        },
                        connectedStations: [],
                        routes: []
                    };
                }

                // Add connected stations (previous and next)
                if (index > 0) {
                    const prevStation = route.stations[index - 1];
                    stationConnections[stationId].connectedStations.push({
                        id: prevStation._id,
                        name: prevStation.name,
                        location: {
                            lat: prevStation.location.lat,
                            lng: prevStation.location.lng
                        }
                    });
                }

                if (index < route.stations.length - 1) {
                    const nextStation = route.stations[index + 1];
                    stationConnections[stationId].connectedStations.push({
                        id: nextStation._id,
                        name: nextStation.name,
                        location: {
                            lat: nextStation.location.lat,
                            lng: nextStation.location.lng
                        }
                    });
                }

                // Add route info
                stationConnections[stationId].routes.push({
                    id: route._id,
                    name: route.name,
                    position: index + 1,
                    totalStations: route.stations.length
                });
            });
        });

        // Calculate network statistics
        const totalStations = stations.length;
        const totalRoutes = routes.length;
        const totalConnections = Object.values(stationConnections).reduce((sum, station) =>
            sum + station.connectedStations.length, 0) / 2; // Divide by 2 since each connection is counted twice

        // Find interchange stations (stations with multiple routes)
        const interchangeStations = Object.values(stationConnections)
            .filter(station => station.routes.length > 1)
            .map(station => ({
                id: station.station.id,
                name: station.station.name,
                location: station.station.location,
                routeCount: station.routes.length,
                routes: station.routes.map(route => ({
                    id: route.id,
                    name: route.name,
                    position: route.position,
                    totalStations: route.totalStations
                }))
            }));

        const networkData = {
            metadata: {
                totalStations,
                totalRoutes,
                totalConnections: Math.round(totalConnections),
                interchangeStations: interchangeStations.length,
                lastUpdated: new Date().toISOString()
            },
            stations: Object.values(stationConnections),
            routes: routeConnections,
            interchanges: interchangeStations,
            statistics: {
                averageStationsPerRoute: totalRoutes > 0 ? Math.round((routes.reduce((sum, route) => sum + route.stations.length, 0) / totalRoutes) * 100) / 100 : 0,
                averageRouteLength: totalRoutes > 0 ? Math.round((routes.reduce((sum, route) => sum + route.distance, 0) / totalRoutes) * 100) / 100 : 0,
                networkDensity: totalStations > 0 ? Math.round((totalConnections / totalStations) * 100) / 100 : 0
            }
        };

        res.json({
            success: true,
            data: networkData
        });
    } catch (error) {
        console.error('Error fetching metro network data:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Apply protection to all other routes
router.use(protectAllRoutes);

// Mount protected routes
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);

// Main website (protected)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// Admin dashboard (protected)
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'admin.html'));
});

// Maps page (protected)
router.get('/maps', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'maps.html'));
});

// User registration page (public)
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'register.html'));
});

// User login page (public)
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'login.html'));
});

// User dashboard (protected)
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'dashboard.html'));
});

module.exports = router;

