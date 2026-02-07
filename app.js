const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path"); //ejs setup

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

app.set("view engine", "ejs"); //ejs setup
app.set("views", path.join(__dirname, "views"));//ejs setup
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("Hi i am root");
});


//Index route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async(req, res) => {
    let { id } = req.params;// parsed from req  
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

//Create route
app.post("/listings", async(req, res) => {
    // let {title, description, price, image, country, location} = req.body;//m1 to extract variables
    let listing = req.body.listing; // listing is a JS obj & can be used directly as document of the listing model
    const newListing = new Listing(listing); //document got created acc to this newly entered listing by user in the create form
    await newListing.save();
    res.redirect("/listings");
    console.log(listing);
});


// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Coimbatore",
//         country: "India"
//     });
    
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });



app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});