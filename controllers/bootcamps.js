const Bootcamp = require('../models/Bootcamp')

//description   Get all bootcamps
//@route        Get /api/v1/bootcamps
//@access       Public
exports.getBootcamps = async (req, res, next) => {
    try {
       const bootcamps = await Bootcamp.find();
       res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })
    } catch (err) {
        res.status(400).json({ success: false})
    }
    
}

//description   Get single bootcamp
//@route        Get /api/v1/bootcamps/:id
//@access       Public
exports.getBootcamp = async (req, res, next) => {
    try {
      const bootcamp =  await Bootcamp.findById(req.params.id)

      if(!bootcamp){
        return res.status(400).json({ success: false})
    }

      res.status(200).json({ success:true, data: bootcamp})

    } catch (err) {
        res.status(400).json({ success: false}) 
    }
   
}

//description   Create new bootcamp
//@route        Post /api/v1/bootcamps
//@access       Private
exports.createBootcamp = async (req, res, next) => {
   try {
    console.log('req.body', req.body);
    const bootcamp = await Bootcamp.create(req.body);
    console.log('bootcamp', bootcamp);
    res.status(201).json({
        success: true,
        data: bootcamp
    });
    console.log('bootcamp', bootcamp)
   } catch (err) {
       res.status(400).json({ err, success: false})
   }
};

//description   Update bootcamp
//@route        Put /api/v1/bootcamps/:id
//@access       Private
exports.updateBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    
        if(!bootcamp){
         return    res.status(400).json({ success: false})
        }
        res.status(200).json({success: true, data: bootcamp})
    } catch (error) {
        res.status(400).json({ success: false})
    }
}


//description   Delete bootcamp
//@route        Post /api/v1/bootcamps
//@access       Private
exports.deleteBootcamp = async (req, res, next) => {

    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if(!bootcamp){
         return   res.status(400).json({success: false})
        }

        res.status(200).json({success: true, data: {}})
    } catch (err) {
        res.status(400).json({success: false})
    }
}