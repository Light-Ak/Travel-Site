const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync');
const { validateReview } = require('../middleware');
const { isLoggedIn } = require('../middleware');
const { isReviewAuthor } = require('../middleware');
const reviewController = require('../controllers/reviews');

// Create a new review for a listing - Create Review Route
router.post("/", isLoggedIn , validateReview, wrapAsync(reviewController.createReview));


// Delete a review from a listing - Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor ,wrapAsync(reviewController.deleteReview));

module.exports = router;