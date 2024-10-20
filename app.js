//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const md5 = require('md5');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// mongoose connection
mongoose.connect('mongodb+srv://creativeblaster14:ejzS3i8XBNWKcg24@cluster0.0ep1y.mongodb.net/Auth?retryWrites=true&w=majority&appName=Cluster0/', {useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//passport plugin
userSchema.plugin(passportLocalMongoose);

//Environment Variables
console.log(process.env.API_KEY);
console.log(process.env.SECRET);
const secret = process.env.SECRET;

// userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password']});

const User = new mongoose.model("simple_password", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser);

app.get('/', function(req, res){
    res.render("home");
});

app.get('/login', function(req, res){
    res.render("login");
});

app.get('/register', function(req, res){
    res.render("register");
});

app.get('/secrets', function(req, res){
    if(req.isAuthenticated()){
        res.render('secrets');
    } else {
        res.render('login');
    }
})

app.post('/register', async function(req, res) {
   User.register({username:req.body.username
}, req.body.password, function(err, user){
    if (err){
        console.log(err);
        res.redirect('/register');        
    } else {
        passport.authenticate("local") (req, res, function(){
            res.redirect('/secrets');
        })
    }
})
});

app.post("/login", async function(req, res) {
    
  
});



app.listen(3000, ()=>{
    console.log("Server started at port 3000");    
})
