const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, '/public')));
const port = 8000 || 3000;


// important for restAPI
const methodOverride = require('method-override');
const passport = require('passport');


const LocalStrategy = require('passport-local');
const User = require('./models/UserDB')
const JourneyDB = require('./models/JourneyDB');



const session = require('express-session');
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

*/

app.get('/search', async (req, res) => {
  const searchLocation = req.query.location;
  try {
    // Construct a case-insensitive regex for search
    const regex = new RegExp(searchLocation, 'i');
    // Perform the search query using the regex
    const journeyObj = await JourneyDB.find({
      $or: [
        { fromLocation: regex },
        { toLocation: regex },
      ],
    });

    res.render('journey/journey', { journeyObj }); // Render the search results page
  } catch (error) {
    console.error('Error searching journeys:', error);
    res.status(500).send('Internal server error');
  }
});


// const dumm = new JourneyDB(dummy).save();
// app.get('/')
// show route 1
// enter details route 

app.get('/route',async (req,res)=>{
    const journeyObj = await JourneyDB.find({}).sort({$natural:-1});
    res.render('journey/journey.ejs',{journeyObj});
})
app.get('/route/add', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('journey/add.ejs');
    } else {
        res.redirect('/login');
    }
})

// // third route post request
app.post('/route', async (req, res) => {
    let { name, email, mobile, fromLocation, toLocation, date } = req.body;
    await JourneyDB.create({ name, email, mobile, fromLocation, toLocation, date });
    res.redirect('/route');
})
// show a single route
app.get('/route/show/:id', async (req, res) => {
    let { id } = req.params;
    let found = await JourneyDB.findById(id);
    // console.log(found);
    res.render('journey/show_new', { found })
})

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
  })
app.get('/', async (req, res) => {
    let journeyObj = await JourneyDB.find({});
    if (req.isAuthenticated()) {
        // The user is logged in
      res.render('userHome',{journeyObj});
    } else {
        res.render('home',{journeyObj});
        // The user is logged out 
    }
})
app.get('/home', async (req, res) => {
    let journeyObj = await JourneyDB.find({});
    if (req.isAuthenticated()) {
        // The user is logged in
      res.render('userHome',{journeyObj});

    } else {
        res.render('home',{journeyObj});
        // The user is logged out 
    }
})
app.post('/send-emails', async (req, res) => {
    if(req.isAuthenticated()){
    try {
        // Fetch all journeys from the database
        const journeys = await JourneyDB.find();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
             user: 'ecorides67@gmail.com',
             pass: 'tntyywcujbkmiupp',
            },
           });

        for (const journey of journeys) {
            const matchingJourneys = journeys.filter(otherJourney => {
                // Match criteria using journey's fromLocation and toLocation
                return (
                    otherJourney.fromLocation === journey.fromLocation &&
                    otherJourney.toLocation === journey.toLocation &&
                    otherJourney.email !== journey.email
                );
            });

            if (matchingJourneys.length > 0) {
                const userEmails = matchingJourneys.map(match => match.email);

                const mailOptions = {
                    from: 'ecorides67@gmail.com',
                    to: userEmails.join(', '),
                    subject: 'Matched Journey Found!',
                    text: 'You have a matched journey. Check it out!! we are excited to say that someone from your location has a matching journey just like you',
                };



            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
        
            return res.status(200).json({ message: 'Email sent successfully' });
            }
        }
    }
    catch (error) {
        console.error('Error sending emails:', error);
        return res.status(500).json({ error: 'An error occurred while sending emails' });
    }
} else res.render('login');
});


app.get('/about', (req, res) => {
    res.render('about');
})
app.get('/help', (req, res) => {
    res.render('help');
})
app.get('/volunteers', (req, res) => {
    res.render('volunteers');
})
















// 404 page !!
app.get('*', (req, res) => {
    res.render('404')
})



app.listen(port, (req, res) => {
    console.log(`console connected on ${port}`);
})