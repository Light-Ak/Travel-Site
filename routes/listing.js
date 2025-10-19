const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isOwner } = require('../middleware');
const { validateListing } = require('../middleware');
const listingsController = require('../controllers/listings');
const multer  = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

// Index and Create Routes
router.route('/')
    .get(wrapAsync(listingsController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing , wrapAsync(listingsController.createNewListing));

// Form to create new listing - New Route
router.get("/new",isLoggedIn, listingsController.createNewListingForm);

// Show, Update, and Delete Routes
router.route('/:id')
    .get(wrapAsync(listingsController.showAllListings))
    .put(isLoggedIn, isOwner, upload.single("listing[image]") , validateListing, wrapAsync(listingsController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

// Form to edit a listing - Edit Route
router.get("/:id/edit",isLoggedIn, isOwner ,wrapAsync(listingsController.renderEditForm));


module.exports = router;