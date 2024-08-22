const Listing = require("../models/listing");



module.exports.index = async (req, res) => {
    const allListings =  await Listing.find({});
   res.render("listings/index.ejs" , { allListings });
 };

module.exports.renderNewform =  (req,res) => {
    res.render("listings/new.ejs"); 
};

module.exports.showListing = async (req, res) => {
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
};

module.exports.createListing = async ( req , res) => {
    let url = req.file.path ;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);   
    newListing.owner = req.user._id;
    newListing.image = { url , filename };
    await newListing.save();
    req.flash("success" , "New Listing created !!");
    res.redirect("/listings");  
};

module.exports.renderEditform = async (req ,res) =>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    console.log(Listing);
    if(!listing){
     req.flash("error" , "Requested Listing doesnot exist !!");
     res.redirect("/listings");
  }else{
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_250");
    res.render("listings/edit.ejs" , { listing , originalImageUrl });
  }
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;  
    let { title, description, imgURL, price, country, location } = req.body.listing;
    console.log(req.body);
 
    try {
        let listing = await Listing.findByIdAndUpdate(
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

        if( typeof req.file !== "undefined") {
           let url = req.file.path ;
           let filename = req.file.filename;
           listing.image = { url , filename };
           await listing.save();
        }

        req.flash("success" , " Listing Updated !!");
        res.redirect(`/listings/${id}`);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
   
};
 module.exports.deleteListing = async (req,res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" , " Listing deleted !!");
    res.redirect("/listings");
};