//contains logic of initialisation of data into database
const mongoose = require("mongoose");
const initData = require("./data.js"); //initData is an object
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

//Ye code har listing ke location ko automatically map coordinates me convert karke DB me save karta hai
const initDB = async () => {
    await Listing.deleteMany({});
    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

    initData.data = await Promise.all(
    initData.data.map(async (obj) => {
        let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${obj.location}`,
        {
            headers: { "User-Agent": "wanderlust-app" }
        }
        );

        let data = await response.json();

        let geometry = {
        type: "Point",
        coordinates: [77.2090, 28.6139] // fallback
        };

        if (data.length > 0) {
        geometry = {
            type: "Point",
            coordinates: [data[0].lon, data[0].lat]
        };
        }

        return {
        ...obj,
        owner: "69b64bb732c5cafce9d7409a",
        geometry
        };
    })
    );
    await Listing.insertMany(initData.data); //initData is an object while 'data' is a key of that object
    console.log("Data was initialised");
}

initDB();