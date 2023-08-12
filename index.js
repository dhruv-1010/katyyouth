const express = require('express');
const app = express();
const path=require('path')
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'))
app.use(express.static(path.join(__dirname,'/public')));
const port = 8000 || 3000;
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/UserDB')
const session = require('express-session');
const { render } = require('ejs');
// body parser
app.use(express.urlencoded({ extended: true })); //for form data
app.use(methodOverride('_method'))

let configSesion = {
    secret: 'user',
    resave: false,
    saveUninitialized: true,
}


app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    next();
})

app.use(session(configSesion));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

passport.use(new LocalStrategy(User.authenticate()));

//  mongo db port
mongoose.connect('mongodb+srv://dhruvsingh235443:wiYdi2EKNvcC1meD@cluster0.lqbsh2q.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{console.log('db connected')})
.catch(()=>{console.log("error");});
// db connected URL

app.get('/register' , (req,res)=>{
    res.render('auth/signup');
})

app.post('/register' , async(req,res)=>{
    let {email , username , password } = req.body;
    const user = new User({email , username});
    const newUser = await User.register(user , password );
    res.redirect('/login');
})
app.get('/login' , (req,res)=>{
    res.render('auth/login');
})
app.post('/login' , passport.authenticate('local', { 
     failureRedirect: '/login' 
    }),
    function(req, res) {
    res.redirect('/home');
})
app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
});


// route 1 
// API ROUTE 1 INDEX ROUTE
app.get('/',(req,res)=>{
    if (req.isAuthenticated()) {
        // The user is logged in
        res.render('userHome')

      } else {
        res.render('home')
        // The user is logged out
      }
})
app.get('/home',(req,res)=>{
    if (req.isAuthenticated()) {
        // The user is logged in
        res.render('userHome')

      } else {
        res.render('home')
        // The user is logged out
      }
})
// ROUTE 2
// new comment route




app.listen(port,(req,res)=>{
    console.log(`console connected on ${port}`);
})