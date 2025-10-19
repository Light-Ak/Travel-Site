const User = require('../models/user');
const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.showProfile = async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId); // get user info

    const listings = await Listing.find({ owner: userId }); // all listings by this user

    const reviews = await Review.find({ author: userId }).populate('listing'); // reviews by this user

    res.render('users/profile', { user, listings, reviews });
};

// Render registration form
module.exports.registerForm = (req, res) => {
    res.render('users/signup');
};

// Handle user registration
module.exports.handleRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;  
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Airbnb!');
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
}

// Render login form
module.exports.loginForm = (req, res) => {
    if (req.query.returnTo) {
        req.session.returnTo = `/listings/${req.query.returnTo}`;
    }
    res.render('users/login');
}

// Handle user login
module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect(res.locals.returnTo || '/listings');
}

// Handle user logout
module.exports.logout = (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        req.flash('success', "Logged Out!");
        res.redirect('/listings');
    });
}