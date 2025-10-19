if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const listingRoutes = require('./routes/listing');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');

const app = express();

// MongoDB session store configuration
const mongoStore = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600 // time period in seconds
});

// Error handling for session store
mongoStore.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
});

// Session configuration
const sessionOptions = {
    store: mongoStore,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookies:{
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true
    },
};

// Middleware setup - Session and Flash
app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Flash middleware to set local variables
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// const mongo_url = "mongodb://127.0.0.1:27017/airbnb";
const mongo_url = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(mongo_url);
}
main().then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.log("MongoDB connection error:", err);
});

// LISTING ROUTES
app.use('/listings', listingRoutes);

// REVIEW ROUTES
app.use('/listings/:id/reviews', reviewRoutes);

// USER ROUTES
app.use('/', userRoutes);

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;
    res.status(status).render("error.ejs",{message,status});
    // res.status(status).send(message);
});