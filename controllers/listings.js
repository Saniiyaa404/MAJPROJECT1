const Listing =  require("../models/listing");
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
    let { id } = req.params;// parsed from req  
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for, does not exists");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id; //newly created listing owner field should have current user's id
        newListing.image = {url, filename};
        // newListing.geometry = {
        //     type: "Point",
        //     coordinates: [77.2090, 28.6139] // Delhi (for now)
        // };
        let location = req.body.listing.location;
        let response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${location}`,
            {
                headers: {
                "User-Agent": "wanderlust-app"
                }
        });
        let data = await response.json();
        if(data.length > 0){
            let lng = data[0].lon;
            let lat = data[0].lat;

            newListing.geometry = {
                type: "Point",
                coordinates: [lng, lat]
            };
        }
        else{
            newListing.geometry = {
                type: "Point",
                coordinates: [77.2090, 28.6139]
            };
        }

        await newListing.save();
        req.flash("success", "New Listing Created!"); 
        res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res) => {
    //id ka use krke us listing ko acquire kr lenge
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for, does not exists");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { 
        runValidators: true,
        new: true
    });
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};