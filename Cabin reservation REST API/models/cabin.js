const mongoose = require('mongoose');

const cabinSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    address: { type: String, index: true, required: true },  
    size: { type: Number, required: true},
    owner: { type: String, required: true },
    sauna: { type: Boolean, default: false },
    beach: { type: Boolean, default: false }
});

module.exports = mongoose.model('Cabin', cabinSchema);