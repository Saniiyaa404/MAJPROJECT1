const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: //if img undefined/null/doesn't exists -> for testing purposes backend
            "https://images.exoticestates.com/files/presets/pg_xl/property/1409/gallery/luxury_maui_beachfront_villa_vacation_rental_01.jpghttps://images.exoticestates.com/files/presets/pg_xl/property/1409/gallery/luxury_maui_beachfront_villa_vacation_rental_01.jpg",
        set: (v) => //img is avaialable but its link is -> empty or non-empty  ->for client side
          v === "" 
            ? "https://images.exoticestates.com/files/presets/pg_xl/property/1409/gallery/luxury_maui_beachfront_villa_vacation_rental_01.jpg" 
            : v
    },
    price: Number,
    location: String,
    country: String
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;