const Listing =  require("../models/listing");

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
        const newListing = new Listing(req.body.listing);
        console.log(req.user);
        newListing.owner = req.user._id; //newly created listing owner field should have current user's id

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
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    if (!req.body.listing.image.url) {
    delete req.body.listing.image.url;
    }
    await Listing.findByIdAndUpdate(id, req.body.listing, { 
        runValidators: true,
        new: true
    });
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