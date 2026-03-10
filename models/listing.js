const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: {
        type: String,
        default: "listingimage"
        },
        url: {
        type: String,
        default:
            "https://images.exoticestates.com/files/presets/pg_xl/property/1409/gallery/luxury_maui_beachfront_villa_vacation_rental_01.jpg"
        }
    },
    price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
    },
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "review",
        },
    ],
});

//mongoose middleware
listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing){ 
    await review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;