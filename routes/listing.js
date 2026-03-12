const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema }= require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");


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

//Index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async(req, res) => {
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
//create route(updated)
// app.post(
//     "/listings",
//     validateListing, 
//     wrapAsync(async (req, res, next) => {
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
//     })
// );
//create route
router.post(
    "/",
    validateListing, 
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//Edit route
router.get("/:id/edit", wrapAsync(async(req, res) => {
    //id ka use krke us listing ko acquire kr lenge
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update route
router.put("/:id", 
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
router.delete("/:id", wrapAsync(async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;