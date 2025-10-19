const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const User = require('./user');

// Define the Listing schema
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        url: String,
        filename: String
    },
    price: Number,
    location: String,
    country : String,
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    category: {
        type: String,
        enum: ['Mountains', 'Seaside', 'Camping', 'Countryside', 'City Life', 'Beach'],
        default: 'City Life'
    }
});

listingSchema.post('findOneAndDelete', async function(listing) {
    if(listing) {
        await Review.deleteMany({
            _id: {
                $in: listing.reviews
            }
        });
    }   
});

module.exports = mongoose.model('Listing', listingSchema);
