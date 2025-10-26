const mongoose = require('mongoose');

// User Schema for passengers
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        },
        address: String
    },
    rating: {
        type: Number,
        default: 5.0,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    totalTrips: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Driver Schema
const driverSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true
    },
    vehicle: {
        make: {
            type: String,
            required: [true, 'Vehicle make is required']
        },
        model: {
            type: String,
            required: [true, 'Vehicle model is required']
        },
        year: {
            type: Number,
            required: [true, 'Vehicle year is required'],
            min: [1990, 'Vehicle year must be 1990 or later'],
            max: [new Date().getFullYear() + 1, 'Vehicle year cannot be in the future']
        },
        licensePlate: {
            type: String,
            required: [true, 'License plate is required'],
            unique: true
        },
        color: {
            type: String,
            required: [true, 'Vehicle color is required']
        },
        capacity: {
            type: Number,
            required: [true, 'Vehicle capacity is required'],
            min: [1, 'Capacity must be at least 1'],
            max: [8, 'Capacity cannot be more than 8']
        }
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    rating: {
        type: Number,
        default: 5.0,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    totalTrips: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    documents: {
        license: String,
        insurance: String,
        registration: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Trip Schema
const tripSchema = new mongoose.Schema({
    passenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    startLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: {
            type: String,
            required: [true, 'Start address is required']
        }
    },
    endLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: {
            type: String,
            required: [true, 'End address is required']
        }
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
        default: 'requested'
    },
    fare: {
        baseFare: {
            type: Number,
            required: true
        },
        distanceFare: {
            type: Number,
            default: 0
        },
        timeFare: {
            type: Number,
            default: 0
        },
        totalFare: {
            type: Number,
            required: true
        }
    },
    distance: {
        type: Number, // in kilometers
        required: true
    },
    estimatedDuration: {
        type: Number, // in minutes
        required: true
    },
    actualDuration: {
        type: Number, // in minutes
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'wallet'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    rating: {
        passengerRating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot be more than 5']
        },
        driverRating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot be more than 5']
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Create indexes for better performance
userSchema.index({ location: '2dsphere' });
driverSchema.index({ currentLocation: '2dsphere' });
tripSchema.index({ startLocation: '2dsphere' });
tripSchema.index({ endLocation: '2dsphere' });
tripSchema.index({ status: 1 });
tripSchema.index({ createdAt: -1 });

// Create models
const User = mongoose.model('User', userSchema);
const Driver = mongoose.model('Driver', driverSchema);
const Trip = mongoose.model('Trip', tripSchema);

module.exports = {
    User,
    Driver,
    Trip
};
