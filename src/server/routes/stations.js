const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all stations
// @route   GET /api/stations
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const stations = await Station.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Station.countDocuments({ isActive: true });

        res.json({
            success: true,
            count: stations.length,
            total,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                limit
            },
            data: stations
        });
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);

        if (!station) {
            return res.status(404).json({
                success: false,
                error: 'Station not found'
            });
        }

        res.json({
            success: true,
            data: station
        });
    } catch (error) {
        console.error('Error fetching station:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Create new station
// @route   POST /api/stations
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, stationType, location, facilities } = req.body;

        // Validation
        if (!name || !location || !location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name and valid location coordinates'
            });
        }

        if (!stationType || !['metro', 'bus_stop', 'terminal', 'interchange'].includes(stationType)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid station type'
            });
        }

        // Validate coordinates
        if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates'
            });
        }

        const station = await Station.create({
            name,
            description: description || '',
            stationType,
            location: {
                lat: location.lat,
                lng: location.lng,
                address: location.address || ''
            },
            facilities: facilities || [],
            createdBy: req.admin.id
        });

        res.status(201).json({
            success: true,
            data: station
        });
    } catch (error) {
        console.error('Error creating station:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// @desc    Update station
// @route   PUT /api/stations/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, description, stationType, location, facilities } = req.body;

        let station = await Station.findById(req.params.id);

        if (!station) {
            return res.status(404).json({
                success: false,
                error: 'Station not found'
            });
        }

        // Check if user owns the station or is super_admin
        if (station.createdBy.toString() !== req.admin.id && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this station'
            });
        }

        // Update fields
        if (name) station.name = name;
        if (description !== undefined) station.description = description;
        if (stationType) station.stationType = stationType;
        if (location) {
            station.location.lat = location.lat || station.location.lat;
            station.location.lng = location.lng || station.location.lng;
            station.location.address = location.address || station.location.address;
        }
        if (facilities) station.facilities = facilities;

        station = await station.save();

        res.json({
            success: true,
            data: station
        });
    } catch (error) {
        console.error('Error updating station:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Delete station
// @route   DELETE /api/stations/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);

        if (!station) {
            return res.status(404).json({
                success: false,
                error: 'Station not found'
            });
        }

        // Check if user owns the station or is super_admin
        if (station.createdBy.toString() !== req.admin.id && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this station'
            });
        }

        // Soft delete by setting isActive to false
        station.isActive = false;
        await station.save();

        res.json({
            success: true,
            message: 'Station deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting station:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Get stations by type
// @route   GET /api/stations/type/:type
// @access  Private
router.get('/type/:type', protect, async (req, res) => {
    try {
        const stationType = req.params.type;
        
        if (!['metro', 'bus_stop', 'terminal', 'interchange'].includes(stationType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid station type'
            });
        }

        const stations = await Station.find({ 
            stationType: stationType,
            isActive: true 
        })
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: stations.length,
            data: stations
        });
    } catch (error) {
        console.error('Error fetching stations by type:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;
