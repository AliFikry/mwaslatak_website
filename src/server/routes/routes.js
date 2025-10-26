const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Station = require('../models/Station');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const routes = await Route.find({ isActive: true })
            .populate('stations', 'name stationType location')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Route.countDocuments({ isActive: true });

        res.json({
            success: true,
            count: routes.length,
            total,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                limit
            },
            data: routes
        });
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const route = await Route.findById(req.params.id)
            .populate('stations', 'name stationType location');

        if (!route) {
            return res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        }

        res.json({
            success: true,
            data: route
        });
    } catch (error) {
        console.error('Error fetching route:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Create new route
// @route   POST /api/routes
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, transportType, stationIds, path, distance, duration, pricing } = req.body;

        // Validation
        if (!name || !stationIds || !Array.isArray(stationIds) || stationIds.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name and at least 2 station IDs'
            });
        }

        if (!transportType || !['metro', 'microbus', 'minibus', 'bus', 'taxi', 'tram'].includes(transportType)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid transport type'
            });
        }

        // Validate that all stations exist
        const stations = await Station.find({ _id: { $in: stationIds }, isActive: true });
        if (stations.length !== stationIds.length) {
            return res.status(400).json({
                success: false,
                error: 'One or more stations not found'
            });
        }

        // Validate pricing
        if (!pricing || !pricing.basePrice || pricing.basePrice < 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide valid pricing information'
            });
        }

        // Set default pricing based on transport type
        const defaultPricing = {
            basePrice: pricing.basePrice,
            pricePerStation: transportType === 'metro' ? (pricing.pricePerStation || 0) : 0,
            currency: pricing.currency || 'EGP'
        };

        const route = await Route.create({
            name,
            description: description || '',
            transportType,
            stations: stationIds,
            path: path || [],
            distance: distance || 0,
            duration: duration || 0,
            pricing: defaultPricing,
            createdBy: req.admin.id
        });

        // Populate stations for response
        await route.populate('stations', 'name stationType location');

        res.status(201).json({
            success: true,
            data: route
        });
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, description, transportType, stationIds, path, distance, duration, pricing } = req.body;

        let route = await Route.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        }

        // Check if user owns the route or is super_admin
        if (route.createdBy.toString() !== req.admin.id && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this route'
            });
        }

        // Update fields
        if (name) route.name = name;
        if (description !== undefined) route.description = description;
        if (transportType) route.transportType = transportType;
        if (stationIds) route.stations = stationIds;
        if (path) route.path = path;
        if (distance !== undefined) route.distance = distance;
        if (duration !== undefined) route.duration = duration;
        if (pricing) {
            route.pricing.basePrice = pricing.basePrice || route.pricing.basePrice;
            route.pricing.pricePerStation = transportType === 'metro' ? (pricing.pricePerStation || route.pricing.pricePerStation) : 0;
            route.pricing.currency = pricing.currency || route.pricing.currency;
        }

        route = await route.save();
        await route.populate('stations', 'name stationType location');

        res.json({
            success: true,
            data: route
        });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        }

        // Check if user owns the route or is super_admin
        if (route.createdBy.toString() !== req.admin.id && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this route'
            });
        }

        // Soft delete by setting isActive to false
        route.isActive = false;
        await route.save();

        res.json({
            success: true,
            message: 'Route deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Get routes by transport type
// @route   GET /api/routes/type/:type
// @access  Private
router.get('/type/:type', protect, async (req, res) => {
    try {
        const transportType = req.params.type;

        if (!['metro', 'microbus', 'minibus', 'bus', 'taxi', 'tram'].includes(transportType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transport type'
            });
        }

        const routes = await Route.find({
            transportType: transportType,
            isActive: true
        })
            .populate('stations', 'name stationType location')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: routes.length,
            data: routes
        });
    } catch (error) {
        console.error('Error fetching routes by type:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Get complete metro network data (Public)
// @route   GET /api/routes/metro-network
// @access  Public
router.get('/metro-network', async (req, res) => {
    try {
        console.log('Metro network API called');
        
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

module.exports = router;
