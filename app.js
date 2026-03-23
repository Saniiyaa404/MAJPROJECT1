if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path"); //ejs setup
const methodOverride = require("method-override"); //method-override
const ejsMate = require("ejs-mate"); //ejs mate required 
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session"); 
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dburl = process.env.ATLASDB_URL;

const PORT = process.env.PORT || 8080;

main()
.then(() => {
    console.log("Connected to DB");

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });

})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dburl);
}

app.set("view engine", "ejs"); //ejs setup
app.set("views", path.join(__dirname, "views"));//ejs setup
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));//method-override
app.engine('ejs', ejsMate); //works like includes/partials in EJS(mate)
app.use(express.static(path.join(__dirname, "/public"))); //to use static files

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", (err) => {
    console.log("error in Mongo Session Store", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
    }
};

app.get("/", (req, res) => {
    res.send("Server working 🚀");
});

app.set("trust proxy", 1);
app.use(session(sessionOptions));
app.use(flash()); 
//pehle flash aayga uske baad routes aaynge bcoz flash will be used in routes, eg: app.use("/listings/:id/reviews", reviews); 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
    //success is an empty array, if success.length > 0 then only show alert
})

//demo user
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "fakeuser@gmamil.com",
//         username: "fakeuser"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld"); 
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Coimbatore",
//         country: "India"
//     });
    
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

//if a request is sent to a non existing route-> We want to send "Page not found" response page
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


//this MW catches the express error and shows statusCode & msg -> Express MW
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", { message });
    //res.status(statusCode).send(message);
});
