const path = require('path')
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan')
const colors = require('colors')
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')



// Load env vars
dotenv.config({ path: './config/config.env'});

// connect to database
connectDB(process.env.DB_URL);
    // connectDB(process.env.MONGO_URI)


//Route files
const bootcamps = require("./routes/bootcamps")
const courses = require("./routes/courses")
const auth = require("./routes/auth")
const users = require("./routes/users")
const reviews = require("./routes/reviews")


const app = express();

//Body Parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())
 
// dev logging middleware
if(process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

  //file uploading
  app.use(fileupload())

  //Sanitize data
  app.use(mongoSanitize())

  //Set security headers
  app.use(helmet())

  //Prevent XSS attacks
  app.use(xss())

  //Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);


app.use(errorHandler)


const PORT = process.env.PORT || 5000;
const server = app.listen(
    PORT,
     console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

     //Handle unhandled promise rejection
     process.on("unhandledRejection", (err, promise) => {
         console.log(`Error :${err.message}`.red);

         //Close server and exit process
        server.close(() => process.exit(1))
     })