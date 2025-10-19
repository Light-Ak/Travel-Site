const Review = require('../models/review');
const Listing = require('../models/listing');

// Create a new review for a listing
module.exports.createReview = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash('error', 'Cannot find that listing!');
            return res.redirect('/listings');
        }

        // Validate input
        const { rating, comment } = req.body.review;
        if (!rating || !comment || comment.trim() === '') {
            req.flash('error', 'Rating and comment are required.');
            return res.redirect(`/listings/${listing._id}`);
        }

        // Create new review
        const review = new Review({
            rating,
            comment,
            author: req.user._id,
            listing: listing._id
        });

        await review.save();

        // Push review reference to listing
        listing.reviews.push(review);
        await listing.save();

        req.flash('success', 'Successfully added review!');
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.error("Error creating review:", err);
        req.flash('error', 'Something went wrong while adding the review.');
        res.redirect(`/listings/${req.params.id}`);
    }
};

// Delete a review from a listing
module.exports.deleteReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;

        // Make sure the review exists and belongs to this listing
        const review = await Review.findById(reviewId);
        if (!review || !review.listing.equals(id)) {
            req.flash('error', 'Review not found for this listing!');
            return res.redirect(`/listings/${id}`);
        }

        // Remove the review reference from the listing
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        // Delete the review document itself
        await Review.findByIdAndDelete(reviewId);

        req.flash('success', 'Successfully deleted review!');
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error('Error deleting review:', err);
        req.flash('error', 'Something went wrong while deleting the review.');
        res.redirect(`/listings/${req.params.id}`);
    }
};
