const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path"); //ejs setup
const methodOverride = require("method-override"); //method-override
const ejsMate = require("ejs-mate"); //ejs mate required 
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema }= require("./schema.js");
const review = require("./models/review.js");

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

//Validation for Schema (middleware)
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;// parsed from req  
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

//Create route
// app.post("/listings", async(req, res) => {
//     // let {title, description, price, image, country, location} = req.body;//m1 to extract variables
//     let listing = req.body.listing; // listing is a JS obj & can be used directly as document of the listing model
//     const newListing = new Listing(listing); //document got created acc to this newly entered listing by user in the create form
//     await newListing.save();
//     res.redirect("/listings");
//     console.log(listing);
// });

// app.post("/listings", async(req, res, next) => {
//     try{
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
//     } catch(err){
//         next(err);
//     }
// })

app.post(
    "/listings",
    validateListing, 
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//Edit route
app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    //id ka use krke us listing ko acquire kr lenge
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update route
app.put("/listings/:id", 
    validateListing,
    wrapAsync(async(req, res) => {
    let { id } = req.params;
    if (!req.body.listing.image.url) {
    delete req.body.listing.image;
    }
    await Listing.findByIdAndUpdate(id, req.body.listing, { 
        runValidators: true,
        new: true
    });
    res.redirect(`/listings/${id}`);
}));

//DELETE route
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//Reviews
//Post review Route

app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Delete review route
//upon deleting a review -> vo reviews collection se delete ho DB se & vo review jis listing ke liye tha uss listing ke reviews array me deleted review ki objectId ko bhi delete kro
//deletion -> DB + listing reviews array

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
    await review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));



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