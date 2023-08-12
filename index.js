const express = require('express');
const app = express();
const path = require('path')


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, '/public')));
const port = 8000 || 3000;


const mongoose = require('mongoose');
// important for restAPI
const methodOverride = require('method-override');

const passport = require('passport');


const LocalStrategy = require('passport-local');
const User = require('./models/UserDB')
const JourneyDB = require('./models/JourneyDB');



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


app.use((req, res, next) => {
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
    .then(() => { console.log('db connected') })
    .catch(() => { console.log("error"); });
// db connected URL
/* 
user login DB
*/
app.get('/register', (req, res) => {
    res.render('auth/signup');
})

app.post('/register', async (req, res) => {
    let { email, username, password } = req.body;
    const user = new User({ email, username });
    const newUser = await User.register(user, password);
    res.redirect('/login');
})
app.get('/login', (req, res) => {
    res.render('auth/login');
})
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login'
}),
    function (req, res) {
        res.redirect('/home');
    })
app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});
/* 
the journey api routes

// // // */
// const dummyJourneys = [
//     {
//         name: "John Doe",
//         date: new Date("2023-08-15"),
//         fromLocation: "New York",
//         toLocation: "Los Angeles",
//         email: "user1@example.com",
//         mobile: "123-456-7890",
//         created: new Date("2023-08-10"),
//         updated: new Date("2023-08-10")
//     },
//     {
//         name: "Jane Smith",
//         date: new Date("2023-09-05"),
//         fromLocation: "Chicago",
//         toLocation: "Miami",
//         email: "user2@example.com",
//         mobile: "987-654-3210",
//         created: new Date("2023-08-11"),
//         updated: new Date("2023-08-11")
//     },
//     {
//         name: "Michael Johnson",
//         date: new Date("2023-08-25"),
//         fromLocation: "Seattle",
//         toLocation: "San Francisco",
//         email: "user3@example.com",
//         mobile: "555-123-4567",
//         created: new Date("2023-08-09"),
//         updated: new Date("2023-08-09")
//     },
//     {
//         name: "Emily Davis",
//         date: new Date("2023-08-18"),
//         fromLocation: "Boston",
//         toLocation: "Orlando",
//         email: "user4@example.com",
//         mobile: "222-333-4444",
//         created: new Date("2023-08-10"),
//         updated: new Date("2023-08-10")
//     },
//     {
//         name: "William Johnson",
//         date: new Date("2023-08-22"),
//         fromLocation: "Denver",
//         toLocation: "Las Vegas",
//         email: "user5@example.com",
//         mobile: "555-999-8888",
//         created: new Date("2023-08-10"),
//         updated: new Date("2023-08-10")
//     },
//     {
//         name: "Linda Anderson",
//         date: new Date("2023-08-27"),
//         fromLocation: "Dallas",
//         toLocation: "Houston",
//         email: "user6@example.com",
//         mobile: "777-444-1111",
//         created: new Date("2023-08-10"),
//         updated: new Date("2023-08-10")
//     },
//     {
//         name: "Robert White",
//         date: new Date("2023-08-20"),
//         fromLocation: "Atlanta",
//         toLocation: "New Orleans",
//         email: "user7@example.com",
//         mobile: "999-888-5555",
//         created: new Date("2023-08-10"),
//         updated: new Date("2023-08-10")
//     },
//     {
//         name: "Maria Rodriguez",
//         date: new Date("2023-08-29"),
//         fromLocation: "Phoenix",
//         toLocation: "Salt Lake City",
//         email: "user8@example.com",
//         mobile: "123-555-7777",
//         created: new Date("2023-08-10"),
//         updated: new Date("2023-08-10")
//     },
//     {
//         name: "Daniel Lee",
//         date: new Date("2023-09-10"),
//         fromLocation: "Minneapolis",
//         toLocation: "Nashville",
//         email: "user9@example.com",
//         mobile: "888-333-2222",
//         created: new Date("2023-08-10"),
//         updated: new Date("2023-08-10")
//     },
//     {
//         name: "Sophia Martinez",
//         date: new Date("2023-09-03"),
//         fromLocation: "Philadelphia",
//         toLocation: "Washington, D.C.",
//         email: "user10@example.com",
//         mobile: "666-777-8888",
//         created: new Date("2023-08-10"),
//         updated: new Date("2023-08-10")
//     }
// ];

// JourneyDB.insertMany(dummyJourneys);

// You can use this dummy data to insert into your MongoDB database using Mongoose.
// const Journey = mongoose.model('Journey', journeySchema);

// // Search for journeys with a partial toLocation match (case-insensitive)
// let searchInput = 'los ang'; // Replace with the user's search input

// // Sanitize the search input by removing non-alphabetical characters
// searchInput = searchInput.replace(/[^a-zA-Z\s]/g, '');

// Journey.find({ toLocation: { $regex: searchInput, $options: 'i' } })
//   .then(journeys => {
//     console.log('Matching journeys:', journeys);
//   })
//   .catch(error => {
//     console.error('Error searching journeys:', error);
//   });

// const dumm = new JourneyDB(dummy).save();
// app.get('/')
// show route 1
// enter details route 
// 
app.get('/route', (req, res) => {
    res.render('journey/journey');
})
app.get('/route/add', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('journey/add.ejs');
    } else {
        res.render('/register');
    }
})
// third route post request
app.post('/route', async (req, res) => {
    let { name, email, mobile, fromLocation, toLocation, date } = req.body;
    await JourneyDB.create({ name, email, mobile, fromLocation, toLocation, date });
    res.redirect('/route');
})
// show a single route
app.get('/route/:id', async (req, res) => {
    let { id } = req.params;
    let found = await Product.findById(id);
    // console.log(found);
    res.render('journey/show', { found })
})
// additional routes
// app.get('/products/:id/edit',async (req,res)=>{
//     let {id} = req.params;
//     let found = await Product.findById(id);
//     // console.log("mika");
//     res.render('products/edit',{found});
// })


// app.patch('/products/:id',async (req,res)=>{
//     let { id }= req.params;
//     let {name ,img ,price ,desc}=  req.body;
//     await Product.findByIdAndUpdate(id,{name,desc,price,img});
//     res.redirect('/products');
// })
// /*

// /*
// // route for editing
// */

// // route for deleteing shit
// router.delete('/products/:id',async (req,res)=>{
//     let {id} = req.params;
//     await Product.findByIdAndDelete(id);
//     res.redirect('/products');
// })























// route 1 
// main index route
app.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        // The user is logged in
        let journeyObj = await JourneyDB.find({});
        res.render('userHome', { journeyObj })

    } else {
        let journeyObj = await JourneyDB.find({});
        res.render('home', { journeyObj })
        // The user is logged out
    }
})
// 
app.get('/home', async (req, res) => {
    if (req.isAuthenticated()) {
        // The user is logged in
        let journeyObj = await JourneyDB.find({});
        res.render('userHome', { journeyObj })

    } else {
        let journeyObj = await JourneyDB.find({});
        res.render('home', { journeyObj })
        // The user is logged out
    }
})
// 404 page !!
app.get('*', (req, res) => {
    req.render('404')
})



app.listen(port, (req, res) => {
    console.log(`console connected on ${port}`);
})