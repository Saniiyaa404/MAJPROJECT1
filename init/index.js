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

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "69b64bb732c5cafce9d7409a"}));//creates a new array having owner field
    await Listing.insertMany(initData.data); //initData is an object while 'data' is a key of that object
    console.log("Data was initialised");
}

initDB();