const mongoose = require('mongoose');
const bookingSchema = require('../models/booking');

const advertSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    cabinId: { type: mongoose.Types.ObjectId, ref: "Cabin", required: true },  
    email: { type: String },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    bookings: [bookingSchema]
});

module.exports = mongoose.model('Advert', advertSchema);