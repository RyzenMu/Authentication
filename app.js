//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

// mongoose connection
mongoose.connect('mongodb+srv://creativeblaster14:ejzS3i8XBNWKcg24@cluster0.0ep1y.mongodb.net/Auth?retryWrites=true&w=majority&appName=Cluster0/', {useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//Environment Variables
console.log(process.env.API_KEY);
console.log(process.env.SECRET);
const secret = process.env.SECRET;

userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password']});

const User = new mongoose.model("simple_password", userSchema);

app.get('/', function(req, res){
    res.render("home");
});

app.get('/login', function(req, res){
    res.render("login");
});

app.get('/register', function(req, res){
    res.render("register");
});

app.post('/register', async function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    try {
        await newUser.save(); // Using Promise with async/await
        res.render("secrets"); // Make sure 'res' is used, not 'req'
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while registering the user.");
    }
});

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });
        
        if (foundUser) {
            if (foundUser.password === password) {
                res.render('secrets');
            } else {
                res.send('Incorrect password.');
            }
        } else {
            res.send('No user found with that email.');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while logging in.");
    }
});



app.listen(3000, ()=>{
    console.log("Server started at port 3000");    
})
