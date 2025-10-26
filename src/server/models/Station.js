const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a station name'],
        trim: true,
        maxlength: [100, 'Station name cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot be more than 200 characters']
    },
    stationType: {
        type: String,
        enum: ['metro', 'bus_stop', 'terminal', 'interchange'],
        required: [true, 'Please select a station type'],
        default: 'metro'
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            maxlength: [200, 'Address cannot be more than 200 characters']
        }
    },
    facilities: [{
        type: String,
        enum: ['parking', 'restroom', 'food', 'wifi', 'atm', 'ticket_office', 'waiting_area']
    }],
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
StationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create index for geospatial queries
StationSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Create index for station type
StationSchema.index({ stationType: 1 });

// Create index for createdBy
StationSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Station', StationSchema);
