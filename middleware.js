const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema }= require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    //console.log(req.path, "..", req.originalUrl);
    //req.path -> relative path & req.originalUrl-> overall path jispe user jana chahte the 
    if (!req.isAuthenticated()){
            //if user is not logged in but they clicked "add new listing", uss path ko save krlo(redirectUrl)
            //redirectUrl -> user login krne ke baad jaha redirect honge, it must be the link they clicked before
            req.session.redirectUrl = req.originalUrl;
            req.flash("error", "you must be logged in to create listing!");
            return res.redirect("/login");
        }
        next();
}

//another mw
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

//checks if the currUser is listing owner or not
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You did not create this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};