const express = require('express');
const mongoose = require('mongoose');
const router = new express.Router();
const Advert = require('../models/advert');
const checkAuth = require('../middleware/check-auth');
const jwt = require('jsonwebtoken');
const Cabin = require('../models/cabin');
const jwtKey = "my_secret_key";

// eventListener for GET requests
router.get('/', (req, res, next) => {
    Advert.find().exec()
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
    Advert.findById(id).exec()
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
    const advert = new Advert({
        _id: new mongoose.Types.ObjectId(),
        cabinId: req.body.cabinId,
        email: req.body.email,
        from: req.body.from,
        to: req.body.to
    });
    advert.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: "Advert successfully created",
            advert: advert
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
    Advert.findById(id).exec()
        .then(document => {
            if(document.email == currentUser.email) {
                Advert.update({_id: req.params.id}, {$set: req.body})
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: "Advert updated!"
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
                        message: "Can not edit other peoples adverts"
                    });
                }
        });
});

// eventListener for DELETE requests
router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;
    const currentUser = jwt.verify(req.header("authorization"), jwtKey);
    Advert.findById(id).exec()
        .then(document => {
            if(document.email == currentUser.email) {
                Advert.remove({_id: req.params.id}).exec()
                .then(result => {
                    res.status(200).json({
                    message: "Advert deleted"
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
                    message: "Can not remove other peoples adverts"
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