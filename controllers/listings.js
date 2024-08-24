const Listing = require("../models/listing");

const axios=require("axios");

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
    let {listing}=req.body;

    let response;
    try {
        response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: listing.location,  // Location from user input
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'wanderlust-project/1.0 (ssubha3333@gmail.com)',
                'Referer': 'https://wanderlust-project-j8ng.onrender.com/'
            }
        });
    } catch (error) {
        console.error('Error during geocoding:', error);
        req.flash('error', 'Failed to geocode the location.');
        return res.redirect('/listings/new');
    }
    
    if (!response.data.length) {
        req.flash('error', 'No geocoding results found.');
        return res.redirect('/listings/new');
    }

    const geoData = response.data[0];
    const coordinates = [parseFloat(geoData.lon), parseFloat(geoData.lat)];



    const newListing = new Listing(req.body.listing);
    if(url){
        newListing.image.url=url;
        newListing.image.filename=filename;
    }   
    newListing.owner = req.user._id;
    newListing.geometry = {
        type: 'Point',
        coordinates: coordinates
    };
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
    let {listing}= req.body;
    console.log(req.body);

    let response;
    try {
        response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: listing.location,  // Location from user input
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'wanderlust-project/1.0 (ssubha3333@gmail.com)',
                'Referer': 'https://wanderlust-project-j8ng.onrender.com/'
            },
        });
    } catch (error) {
        console.error('Error during geocoding:', error);
        req.flash('error', 'Failed to geocode the location.');
        return res.redirect('/listings/new');
    }
    
    if (!response.data.length) {
        req.flash('error', 'No geocoding results found.');
        return res.redirect('/listings/new');
    }

    const geoData = response.data[0];
    const coordinates = [parseFloat(geoData.lon), parseFloat(geoData.lat)];
 
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
                    location: location,
                    geometry: {
                        type: 'Point',
                        coordinates: coordinates,
                    }
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