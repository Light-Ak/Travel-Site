const Listing = require('../models/listing');
const { cloudinary } = require('../cloudConfig');

// List all listings - Index Route
module.exports.index = async (req, res) => {
    const category = req.query.category;
    const search = req.query.search?.trim(); // optional search query

    let query = {};

    // Category filtering
    if (category === "Budget Friendly") {
        query.price = { $lt: 1500 };
    } else if (category) {
        query.category = category;
    }

    // Search filtering
    if (search) {
        // Case-insensitive regex search on title or location
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }

    const listings = await Listing.find(query);

    res.render('listings/index', { listings, selectedCategory: category || '', searchQuery: search || '' });
};


// Form to create new listing - New Route
module.exports.createNewListingForm = (req, res) => {
    res.render("listings/new");
}

// Show details of a specific listing - Show Route
module.exports.showAllListings = async (req, res) => {
    const { id } = req.params;
    // populate reviews so you get actual data, not just ObjectIds
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: { path: "author" }  // populate the author inside each review
    })
    .populate("owner"); // populate the listing owner
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect("/listings");
    }

    // Find nearby listings (example by same location or country)
  const nearbyListings = await Listing.find({
    _id: { $ne: id },
    country: listing.country
  }).limit(4);

    res.render("listings/show.ejs", { listing , nearbyListings});
}

// Create a new listing - Create Route
module.exports.createNewListing = async (req, res) => {
    
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing); // ✅ expects nested listing
    newListing.owner = req.user._id; // set the owner to the logged-in user
    // newListing.image = {url, filename}; // set the image url and filename
    await newListing.save();
    req.flash('success', 'Successfully made a new listing!');
    res.redirect("/listings");
}

// Form to edit a listing - Edit Route
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image ? listing.image.url : null;
    originalImageUrl = originalImageUrl.replace('/upload/', '/upload/w_600/');

    res.render("listings/edit", { listing , originalImageUrl });
}

// Update a listing - Update Route
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }

  // Update basic fields
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;
  listing.category = req.body.listing.category;

  // ✅ If new image uploaded, delete old one from Cloudinary
  if (req.file) {
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    // then update with the new Cloudinary image
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();

  req.flash('success', 'Successfully updated listing!');
  res.redirect(`/listings/${listing._id}`);
};

// Delete a listing - Delete Route
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  // Find the listing first
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // ✅ Delete image from Cloudinary (if it exists)
  if (listing.image && listing.image.filename) {
    try {
      await cloudinary.uploader.destroy(listing.image.filename);
      console.log("Deleted image from Cloudinary:", listing.image.filename);
    } catch (err) {
      console.error("Cloudinary deletion failed:", err);
    }
  }

  // Delete the listing from MongoDB
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Successfully deleted listing");
  res.redirect("/listings");
};

