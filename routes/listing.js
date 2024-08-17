const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require ("../models/listing.js");
const { isLoggedIn , isOwner , validatelisting } = require("../middleware.js");




//index route
router.get ("/" , wrapAsync (async (req, res) => {
    const allListings =  await Listing.find({});
   res.render("listings/index.ejs" , { allListings });
 })
);  


//new route
router.get("/new" , isLoggedIn, (req,res) => {
     res.render("listings/new.ejs"); 
});


//show route
router.get("/:id" , wrapAsync (async (req, res) => {
    let { id } = req.params;
     const listing = await Listing.findById(id)
     .populate( { path : "reviews" ,
         populate : { 
            path : "author" ,
         }, 
        }).populate("owner");
    
     if(listing===null){
        req.flash("error" , "Requested Listing doesnot exist !!");
        res.redirect("/listings");
     }else{
        //console.log(listing);
        res.render("listings/show.ejs" , { listing });
     }
}));

//create route
//create route
router.post("/" , isLoggedIn ,validatelisting , wrapAsync (async ( req , res) => {
  
    const newListing = new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success" , "New Listing created !!");
    res.redirect("/listings");  
   })
 );

//edit route
router.get("/:id/edit" , isLoggedIn, isOwner , wrapAsync (async (req ,res) =>{
   let { id } = req.params;
   const listing = await Listing.findById(id);
   console.log(Listing);
   if(!listing){
    req.flash("error" , "Requested Listing doesnot exist !!");
    res.redirect("/listings");
 }else{
   res.render("listings/edit.ejs" , {listing});
 }
}));

//update route
router.put("/:id", isLoggedIn , isOwner , wrapAsync (async (req, res) => {
   let { id } = req.params;  
   let { title, description, imgURL, price, country, location } = req.body;

   try {
       await Listing.findByIdAndUpdate(
           id,
           {
               $set: {
                   title: title,
                   description: description,
                   "image.url": imgURL, 
                   price: price,
                   country: country,
                   location: location
               }
           },
           { new: true } // Optionally return the updated document
       );
       req.flash("success" , " Listing Updated !!");
       res.redirect(`/listings/${id}`);
   } catch (error) {
       res.status(500).json({ error: error.message });
   }
  
}));


//delete route
router.delete("/:id" , isLoggedIn, isOwner , wrapAsync (async (req,res) => {
   let { id } = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success" , " Listing deleted !!");
   res.redirect("/listings");
}));

module.exports = router;
