const express = require('express');
const mongoose = require('mongoose');
const router = new express.Router();
const Cabin = require('../models/cabin');
const checkAuth = require('../middleware/check-auth');
const jwt = require('jsonwebtoken');
const jwtKey = "my_secret_key";

// eventListener for GET requests
router.get('/', (req, res, next) => {
    Cabin.find().exec()
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
    Cabin.findById(id).exec()
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
    try {
        const cabin = new Cabin({
            _id: mongoose.Types.ObjectId(),
            address: req.body.address,
            size: req.body.size,
            owner: req.body.owner,
            sauna: req.body.sauna,
            beach: req.body.beach
        });

        cabin.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Cabin successfully created",
                cabin: cabin
            });
        });
    } catch(error) {
        console.log(error);
        const err = new Error(error);
        err.status = error.status || 500;

        next(err);
    }
});

// eventListener for PUT requests
router.patch('/:id', checkAuth, (req, res, next) => {    
    const id = req.params.id;
    const currentUser = jwt.verify(req.header("authorization"), jwtKey);
    Cabin.findById(id).exec()
        .then(document => {
            if(document.owner == currentUser.email) {
                Cabin.update({_id: req.params.id}, {$set: req.body})
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: "Cabin updated!"
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
                        message: "Can not edit other peoples cabins"
                    });
                }
        });
}); 

// eventListener for DELETE requests
router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;
    const currentUser = jwt.verify(req.header("authorization"), jwtKey);
    Cabin.findById(id).exec()
        .then(document => {
            if(document.owner == currentUser.email) {
                Cabin.remove({_id: req.params.id}).exec()
                .then(result => {
                    res.status(200).json({
                    message: "Cabin deleted"
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
                    message: "Can not remove other peoples cabins"
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