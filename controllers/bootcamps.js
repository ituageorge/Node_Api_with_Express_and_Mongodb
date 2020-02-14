//description   Get all bootcamps
//@route        Get /api/v1/bootcamps
//@access       Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({success: true, message: "Show all bootcamps"})
}

//description   Get single bootcamp
//@route        Get /api/v1/bootcamps/:id
//@access       Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({success: true, message: `Show bootcamp ${req.params.id}`})
}

//description   Create new bootcamp
//@route        Post /api/v1/bootcamps
//@access       Private
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({success: true, message: "Create new bootcamp"})
}

//description   Update bootcamp
//@route        Put /api/v1/bootcamps/:id
//@access       Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({success: true, message: `Update bootcamp ${req.params.id}`})
}


//description   Delete bootcamp
//@route        Post /api/v1/bootcamps
//@access       Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({success: true, message: `Delete bootcamp ${req.params.id}`})
}