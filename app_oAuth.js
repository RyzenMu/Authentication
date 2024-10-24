//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  session({
    secret: "Our little secret.",
    resave: false, // Don't resave session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
  })
);

app.use(passport.initialize());
app.use(require("morgan")("combined"));

app.use(passport.session());

// mongoose connection
mongoose.connect(
  "mongodb+srv://creativeblaster14:ejzS3i8XBNWKcg24@cluster0.0ep1y.mongodb.net/Auth?retryWrites=true&w=majority&appName=Cluster0/",
  { useNewUrlParser: true }
);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//Environment Variables
console.log(process.env.API_KEY);
console.log(process.env.SECRET);
const secret = process.env.SECRET;

// userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password']});

// const User = new mongoose.model("simple_password", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
  console.log("Authenticated?", req.isAuthenticated()); // Check if authenticated
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login"); // Changed to redirect to avoid rendering the login page
  }
});

app.post("/register", function (req, res) {
  console.log("Register request received...");

  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log("Error during registration:", err);
        res.redirect("/register");
      } else {
        console.log("User registered successfully:", user);

        req.login(user, function (err) {
          // Manually log in the user
          if (err) {
            console.log("Login error after registration:", err); // Log any login error
            res.redirect("/login");
          } else {
            console.log("User logged in successfully.");
            res.redirect("/secrets");
          }
        });
      }
    }
  );
});

app.post("/login", async function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    // Provide a callback function
    if (err) {
      return next(err); // Handle any potential errors
    }
    res.redirect("/"); // On successful logout, redirect to the home page
  });
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
