const joi = require('joi');
const listing = require('./models/listing');

const listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        price: joi.number().required().min(0),
        location: joi.string().required(),
        country: joi.string().required(),
        category: joi.string()
            .valid('Mountains', 'Seaside', 'Camping', 'Countryside', 'City Life', 'Beach'),
        image: joi.object({
            url: joi.string().uri().required(),
            filename: joi.string().required()
        }).required()
    }).required()
});


module.exports.listingSchema = listingSchema;

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required()
    }).required()
});

module.exports.userSchema = joi.object({
    username: joi.string().required(),
    email: joi.string().required().email(),
    password: joi.string().required().min(6)
});
