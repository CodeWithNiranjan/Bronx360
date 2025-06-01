const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['pothole', 'graffiti', 'streetlight', 'garbage', 'other']
    },
    status: {
        type: String,
        required: true,
        enum: ['open', 'in-progress', 'resolved'],
        default: 'open'
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema); 