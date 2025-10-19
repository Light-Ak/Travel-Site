const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const {isLoggedIn} = require('../middleware');

const { userSchema } = require('../schema');
const passport = require('passport');
const { saveReturnTo } = require('../middleware');
const userController = require('../controllers/users');

// Middleware to validate user data
const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

router.get('/profile', isLoggedIn, wrapAsync(userController.showProfile));

// Handle user registration
router.route('/signup')
    .get(userController.registerForm)
    .post(validateUser, wrapAsync(userController.handleRegister));

// Handle user login
router.route('/login')
    .get(userController.loginForm)
    .post(saveReturnTo, passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }), userController.login);

// Handle user logout
router.get('/logout', userController.logout);

module.exports = router;