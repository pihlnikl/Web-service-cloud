const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cabinRoutes = require('./routes/cabins');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const advertRoutes = require('./routes/adverts');

// Sätter upp förbindelse till databasen
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://user:password@cluster-webtjanster.rktwe.mongodb.net/Cluster-webtjanster?retryWrites=true&w=majority');

// Router
// Alla requests loggas på konsolen
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extented: false}));

// Parsar alla inkommande json-objekt
app.use(bodyParser.json());

// Requests till localhost:8080/...
app.use('/cabins', cabinRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);
app.use('/adverts', advertRoutes);

app.use((req, res, next) => {
    if (req.headers["Authorization"]) {
        const token = req.headers["Authorization"];
        const { userId, exp } = jwt.verify(token, "my_secret_key");
        next();
    } else {
        next();
    }
});

// En fel request (annan än /cabins, /bookings, /users, /adverts)
app.use((req, res, next) => {
    const error = new Error("URL hittas inte!");
    error.status = 404;
    next(error);
});

// Alla andra fel
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status,
        error: error.message
    });
});

// Gör app exporterbar
module.exports = app;