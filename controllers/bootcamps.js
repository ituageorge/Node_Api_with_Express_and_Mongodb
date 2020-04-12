const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

//description   Get all bootcamps
//@route        Get /api/v1/bootcamps 
//@access       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        
       res.status(200).json(res.advancedResults)  
});

//description   Get single bootcamp
//@route        Get /api/v1/bootcamps/:id
//@access       Public
exports.getBootcamp = asyncHandler (async (req, res, next) => {
      const bootcamp =  await Bootcamp.findById(req.params.id)

      if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

      res.status(200).json({ success:true, data: bootcamp});
})

//description   Create new bootcamp
//@route        Post /api/v1/bootcamps
//@access       Private
exports.createBootcamp = asyncHandler( async (req, res, next) => {
    // AAdd user to req.body
    req.body.user = req.user.id;

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id});

    // If the user is not in admin , they can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
    }
   
    const bootcamp = await Bootcamp.create(req.body);
    console.log('bootcamp', bootcamp);
    res.status(201).json({
        success: true,
        data: bootcamp
    });
    console.log('bootcamp', bootcamp)

});

//description   Update bootcamp
//@route        Put /api/v1/bootcamps/:id
//@access       Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404))
        }
        res.status(200).json({success: true, data: bootcamp})
    
})


//description   Delete bootcamp
//@route        Post /api/v1/bootcamps
//@access       Private
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {

        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404))
        }

        bootcamp.remove();

        res.status(200).json({success: true, data: {}})
})

//description   Get bootcamps within a radius
//@route        Get /api/v1/bootcamps/radius/:zipcode/:distance
//@access       Private
exports.getBootcampsInRadius = asyncHandler( async (req, res, next) => {

    const { zipcode, distance } = req.params;

    //Get latitude/longitude from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [lng, lat ], radius ]}}
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})


//description   Upload photo for bootcamp
//@route        Put /api/v1/bootcamps/:id/photo
//@access       Private
exports.bootcampPhotoUpload = asyncHandler( async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404))
    }

    if(!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file

    //Make sure the image is a photo
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    //Check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}`, 400));  
    }

    //Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    console.log(file.name)

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err)
            return next(new ErrorResponse(`Problem with file upload`, 500));   
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        })
    })
})

