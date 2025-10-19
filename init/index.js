const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');

const mongo_url = "mongodb://127.0.0.1:27017/airbnb";
async function main() {
    await mongoose.connect(mongo_url);
}
main().then(() => {
    console.log("MongoDB connected");
}).catch((err) => {
    console.log("MongoDB connection error:", err);
});

const initDB = async () => {
    try {
        // Delete existing listings
        await Listing.deleteMany({});

        const listings = initdata.data.map(listing => {
            // Ensure image is always an object with url & filename
            let imageObj;
            if (typeof listing.image === 'string') {
                imageObj = {
                    url: listing.image,
                    filename: listing.image.split('/').pop()
                };
            } else if (listing.image && typeof listing.image === 'object') {
                imageObj = {
                    url: listing.image.url || '',
                    filename: listing.image.filename || listing.image.url?.split('/').pop() || ''
                };
            } else {
                imageObj = { url: '', filename: '' };
            }

            // Return the complete listing object
            return {
                ...listing,
                image: imageObj,
                owner: "68f02c050e827eba43309489", // Default owner
                category: listing.category || "City Life" // Default category if missing
            };
        });

        // Insert all listings
        await Listing.insertMany(listings);
        console.log("Database initialized with sample data");
    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        mongoose.connection.close();
    }
};



initDB();