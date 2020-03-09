const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')

//description   Get all bootcamps
//@route        Get /api/v1/bootcamps
//@access       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    
       const bootcamps = await Bootcamp.find();
       res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })  
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

        res.status(200).json({success: true, data: {}})
})