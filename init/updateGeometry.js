const mongoose = require("mongoose");
const Listing = require("../models/listing");

// fetch setup
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const updateListings = async () => {
  let allListings = await Listing.find({});

  for (let listing of allListings) {
    if (!listing.geometry) {
      try {
        let response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${listing.location}`,
          {
            headers: { "User-Agent": "wanderlust-app" }
          }
        );

        let data = await response.json();

        if (data.length > 0) {
          let lng = data[0].lon;
          let lat = data[0].lat;

          listing.geometry = {
            type: "Point",
            coordinates: [lng, lat]
          };

          await listing.save();
          console.log(`Updated: ${listing.title}`);
        } else {
          console.log(`No data for: ${listing.title}`);
        }
      } catch (err) {
        console.log(`Error for ${listing.title}`, err);
      }
    }
  }

  console.log("All listings updated!");
  mongoose.connection.close();
};

updateListings();