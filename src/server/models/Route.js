const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a route name'],
        trim: true,
        maxlength: [50, 'Route name cannot be more than 50 characters']
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot be more than 200 characters']
    },
    transportType: {
        type: String,
        enum: ['metro', 'microbus', 'minibus', 'bus', 'taxi', 'tram'],
        required: [true, 'Please select a transport type'],
        default: 'metro'
    },
    stations: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Station',
        required: true
    }],
    path: [{
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    }],
    distance: {
        type: Number,
        required: true,
        min: [0, 'Distance cannot be negative']
    },
    duration: {
        type: Number,
        min: [0, 'Duration cannot be negative']
    },
    pricing: {
        basePrice: {
            type: Number,
            required: true,
            min: [0, 'Base price cannot be negative']
        },
        pricePerStation: {
            type: Number,
            default: 0,
            min: [0, 'Price per station cannot be negative']
        },
        currency: {
            type: String,
            default: 'EGP',
            enum: ['EGP', 'USD', 'EUR']
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'Admin',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
RouteSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create index for createdBy
RouteSchema.index({ createdBy: 1 });

// Create index for transportType
RouteSchema.index({ transportType: 1 });

// Create index for stations
RouteSchema.index({ stations: 1 });

module.exports = mongoose.model('Route', RouteSchema);
