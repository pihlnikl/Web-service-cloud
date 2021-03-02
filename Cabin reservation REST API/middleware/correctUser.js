const UserModel = require('../models/user');

module.exports = (req, res, next) => {
    try {
        const token = jwt.verify(req.header("authorization"), "my_secret_key");
        return token;
    }
    // Om vi inte lyckas verifiera JWT
    catch(error) {
        return res.json(error).status(500);
    }
};
