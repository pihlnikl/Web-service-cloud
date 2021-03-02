const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
    const decoded = jwt.verify(req.header("authorization"), "my_secret_key");
    console.log(decoded);
    // Om vi lyckas verifiera JWT ----> next()
    next();
    }
    // Om vi inte lyckas verifiera JWT
    catch(error) {
        res.status(401).json({
            message: "Authentication failed"
        });
    }
};