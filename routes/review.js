const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require ("../models/review.js");
const Listing = require ("../models/listing.js");
//const validateReview = require("../middleware.js");
const { validateReview , isLoggedIn  , isReviewAuthor } = require("../middleware.js");

// controllers
const reviewController = require("../controllers/reviews.js");


//post reviews route
router.post ("/" , isLoggedIn , validateReview , wrapAsync(reviewController.createReview));

//Delete review Route
router.delete("/:reviewId" , isReviewAuthor , wrapAsync(reviewController.deleteReview));


module.exports = router;