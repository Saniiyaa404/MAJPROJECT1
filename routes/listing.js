const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

//Index and create route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        validateListing, 
        wrapAsync(listingController.createListing)
    );

    
//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);


//Show, Update and Delete route
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put( 
        isLoggedIn,
        isOwner,
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

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

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;