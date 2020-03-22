//this auth.js middleware function is used for protect
//jwt is needed to verify the token
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
// here we need the user model, because we need to look up the user by the id that is in the token
const User = require('../models/User');

//  Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if(
        req.headers.authorization &&
         req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }
        // else if(req.cookies.tokens) {
        //     token = req.cookies.token
        // }

       // Make sure token exists
       if(!token) {
           return next(new ErrorResponse('Not authorized to access this route', 401));
       }
     try {
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        //currently logged in user
        req.user = await User.findById(decoded.id);
        next();
     } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
     }
})