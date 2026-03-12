const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path"); //ejs setup
const methodOverride = require("method-override"); //method-override
const ejsMate = require("ejs-mate"); //ejs mate required 
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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
app.use(methodOverride("_method"));//method-override
app.engine('ejs', ejsMate); //works like includes/partials in EJS(mate)
app.use(express.static(path.join(__dirname, "/public"))); //to use static files

app.get("/", (req, res) => {
    res.send("Hi i am root");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

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

//if a request is sent to a non existing route-> We want to send "Page not found" response page
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


//this MW catches the express error and shows statusCode & msg -> Express MW
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", { message });
    //res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});