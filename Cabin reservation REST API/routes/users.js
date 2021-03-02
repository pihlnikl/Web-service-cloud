const express = require('express'),
mongoose = require('mongoose'),
router = express.Router(),
User = require('../models/user'),
bcrypt = require('bcrypt'),
jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const jwtKey = "my_secret_key";
const jwtExpire = "2h";

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(user => {
        if (user.length > 0) {
            res.status(400).json({
                message: "Email already in use"
            });
        }
        else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    res.status(500).json({
                        message: err
                    });
                }
                else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        password: hash,
                    });

                    const token = jwt.sign({ email: req.body.email },  jwtKey, { 
                        expiresIn: jwtExpire,
                        });

                    user.save()
                        .then(result => {
                            res.status(201).json({
                                message: "User registered",
                                token: token
                            });
                        })
                        .catch(error => {
                            console.log(error);
                            const err = new Error(error);
                            err.status = error.status || 500;
                    
                            next(err);
                        });
                }
            });
        }
    });
});
router.get('/', (req, res, next) => {
    User.find().exec()
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
    
    User.findById(id).exec()
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

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(user => {
        if (user.length < 1) {
            res.status(401).json({
                message: "Authentication failed"
            });
        }
        else {
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    res.status(401).json({
                        message: "Authentication failed"
                    });
                }
                else if (result) {
                    // Generera en JWT för användaren
                    const token = jwt.sign({ email: req.body.email },  jwtKey, { 
                        expiresIn: jwtExpire, });
                    const decoded = jwt.decode(token);

                    res.status(200).json({
                        message: "Authentication Successfull",
                        token: token,
                        userEmail: decoded.email
                    });
                }
                else {
                    res.status(401).json({
                        message: "Authentication failed"
                    });
                }
            });
        }
    })
    .catch();
});

router.patch('/:id', checkAuth, (req, res, next) => {    
    const id = req.params.id;
    const currentUser = jwt.verify(req.header("authorization"), jwtKey);
    User.findById(id).exec()
        .then(document => {
            if(document.owner == currentUser.email) {
                User.update({_id: req.params.id}, {$set: req.body})
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: "User updated!"
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
                        message: "Can not edit other users"
                    });
                }
        });
}); 

router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;
    const currentUser = jwt.verify(req.header("authorization"), jwtKey);
    User.findById(id).exec()
        .then(document => {
            if(document.owner == currentUser.email) {
                User.remove({_id: req.params.id}).exec()
                .then(result => {
                    res.status(200).json({
                    message: "User deleted"
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
                    message: "Can not remove other users"
                });
            }
        });
});

module.exports = router;