const express = require("express");
const router = express.Router({ mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


//Post review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete review route
//upon deleting a review -> vo reviews collection se delete ho DB se & vo review jis listing ke liye tha uss listing ke reviews array me deleted review ki objectId ko bhi delete kro
//deletion -> DB + listing reviews array

router.delete("/:reviewId", isReviewAuthor, isLoggedIn, wrapAsync(reviewController.destroyReview));

module.exports = router;

