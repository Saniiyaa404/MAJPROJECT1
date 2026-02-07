const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    price: Number,
    location: String,
    country: String
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;