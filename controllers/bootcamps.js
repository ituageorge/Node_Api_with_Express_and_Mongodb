const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

//description   Get all bootcamps
//@route        Get /api/v1/bootcamps
//@access       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    //Copy req.query
    const reqQuery = {...req.query}

    // Fields to exclude
    const removeFields = ['select','sort', 'page', 'limit']

    //loop over removeFields and delete them from reqQuery
    removeFields.forEach(params => delete reqQuery[params]);

    console.log(reqQuery)

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    console.log(queryStr);

    // create operators like ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    //Finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    // Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
        console.log(fields)
    }

    //Sorting Fields
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        query.sort('-createdAt')
    }

    //Pagination
    const page = parseInt(req.query.page, 1) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    //(with mongoose we can await Bootcamp)
    const total = await Bootcamp.countDocuments()

    query = query.skip(skip)

    //Executing query
       const bootcamps = await query; 

       //Pagination result
       const pagination = {};

       if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
} 

    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
       res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps })  
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
   
    console.log('req.body', req.body);
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

