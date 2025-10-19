const Listing = require('./models/listing');
const Review = require('./models/review');
const { listingSchema } = require('./schema');
const ExpressError = require('./utils/ExpressError');
const { reviewSchema } = require('./schema');

// Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

// Middleware to save the URL the user was trying to access
module.exports.saveReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// Middleware to check if the current user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;

    // Find the listing first
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    
    // Check ownership
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash('error', 'You are not the owner of this listing!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// Middleware to validate listing data
module.exports.validateListing = (req, res, next) => {

    // 1️⃣ Inject image info into req.body.listing
    if (req.file) {
        // If user uploaded an image
        req.body.listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    } else {
        // If no file uploaded, use default image
        req.body.listing.image = {
            url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?...",
            filename: "defaultImage.jpg"
        };
    }

    // 2️⃣ Run Joi validation
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};


// Middleware to validate review data
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found!');
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};