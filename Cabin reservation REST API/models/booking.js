const mongoose = require('mongoose');
const Advert = require('../models/advert');

const bookingSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    email: { type: String, required: true },
    advertId: { type: mongoose.Types.ObjectId, ref: "Advert", required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true }
});

bookingSchema.path('from').validate(function(value) {
    const advertId = this.advertId;
    const newBookingStart = value.getTime();
    const newBookingEnd = this.to.getTime();

    /*Advert.findById(advertId).exec()
        .then(document => {
            aFrom = document.from;
            aTo = document.to;
        });
    const availableFrom = aFrom.getTime();
    const availableTo = aTo.getTime();*/

    const clashesWithExisting = (existingBookingStart, existingBookingEnd, newBookingStart, newBookingEnd) => {
        if (newBookingStart >= existingBookingStart && newBookingStart < existingBookingEnd || 
          existingBookingStart >= newBookingStart && existingBookingStart < newBookingEnd) {
                throw new Error('Cabin not availabe at this time');
            }
        return false;
    };

    return Advert.findById(advertId)
        .then(advert => {
            return advert.bookings.every(booking => {
                const existingBookingStart = new Date(booking.from).getTime();
                const existingBookingEnd = new Date(booking.to).getTime();

                return !clashesWithExisting(
                    existingBookingStart,
                    existingBookingEnd,
                    newBookingStart,
                    newBookingEnd
                );
            });
        });
}, '{REASON}');

module.exports = mongoose.model('Booking', bookingSchema);