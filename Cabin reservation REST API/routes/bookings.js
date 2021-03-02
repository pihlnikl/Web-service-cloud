const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Booking = require('../models/booking');
const checkAuth = require('../middleware/check-auth');
const jwtKey = "my_secret_key";
const jwt = require('jsonwebtoken');
const Advert = require('../models/advert');

// eventListener for GET requests
router.get('/', (req, res, next) => {
    Booking.find()
    .exec()
    .then(document => {
        res.status(200).json(document);
    })
    .catch(error => {
        console.log(error);
        const err = new Error(error);
        err.status = error.status || 500;

        next(err);
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Booking.findById(id)
        .exec()
        .then(document => {
            res.status(200).json(document);
        })
        .catch(error => {
            console.log(error);
            const err = new Error(error);
            err.status = error.status || 500;
            
            next(err);
        });
});
// eventListener for POST requests
router.post('/', checkAuth, (req, res, next) => {
    const booking = new Booking({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        advertId: req.body.advertId,
        from: req.body.from,
        to: req.body.to
    });
    Advert.findByIdAndUpdate(
        booking.advertId,
        {
            $addToSet: {
                bookings: {
                    email: booking.email,
                    from: booking.from,
                    to: booking.to,
                    _id: booking._id,
                    advertId: booking.advertId
                }
            }
        },
        { new: true, runValidators: true, context: 'query' }
    )
    .catch(error => {
        res.status(400).json({ error });
    });
    
    booking.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Booking successfully created",
                booking: booking
            });
        })
        .catch(error => {
            console.log(error);
            const err = new Error(error);
            err.status = error.status || 500;

            next(err);
        });
});
// eventListener for PUT requests
router.patch('/:id', checkAuth, (req, res, next) => {    
    const id = req.params.id;
    const currentUser = jwt.verify(req.header("authorization"), jwtKey);
    Booking.findById(id).exec()
        .then(document => {
            if(document.email == currentUser.email) {
                Booking.update({_id: req.params.id}, {$set: req.body})
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: "Booking updated!"
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        const err = new Error(error);
                        err.status = error.status || 500;
                        
                        next(err);
                    });
                } else {
                    return res.status(401).json({
                        message: "Can not edit other peoples bookings"
                    });
                }
        });
}); 
// eventListener for DELETE requests
router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;
    const currentUser = jwt.verify(req.header("authorization"), jwtKey);
    Booking.findById(id).exec()
        .then(document => {
            if(document.email == currentUser.email) {
                Booking.remove({_id: req.params.id}).exec()
                .then(result => {
                    res.status(200).json({
                        message: "Booking deleted"
                    });
                })
                .catch(error => {
                    console.log(error);
                    const err = new Error(error);
                    err.status = error.status || 500;

                    next(err);
                });
                advertId = document.advertId;
                Advert.findByIdAndUpdate(
                    advertId,
                    { $pull: { bookings: { _id: req.params.id} } },
                    { new: true }
                )
                .catch(error => {
                    res.status(400).json({ error });
                });
            } else {
                return res.status(401).json({
                    message: "Can not remove other peoples bookings"
                });
            }
        });
});
router.use((req, res, next) => {
    const error = new Error("Only GET, POST, PUT, DELETE commands supported");
    error.status = 500;
    next(error);
});

module.exports = router;