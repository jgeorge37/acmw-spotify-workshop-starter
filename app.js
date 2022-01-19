import express from 'express'; 
import expressSession from 'express-session';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { spotifyCallback, spotifyLogin } from './spotify.js';

// create express app 
var app = express();
app.set('views', './views');
app.set('view engine', 'ejs');  // use embedded javascript view engine

app.use(express.static(process.cwd() + '/views'))  // server static files from views dir
  .use(cors())  // enable cross-origin requests
  .use(cookieParser())  // enable reading of cookies in request object
  .use(expressSession({  // enable session storage
    secret: process.env.SESSION_SECRET,  // used to hash the session
    resave: false,
    saveUninitialized: true
  })) 

app.get('/', function(req, res) {
  res.render('index');  // render the index view at website home
});

app.get('/profile', function(req, res) {
  const topTracks = req.session.topTracks;  // retrieve top tracks from session storage
  res.render('profile', {  // render the profile view with the top tracks
    tracks: topTracks
  });
})

app.get('/login', spotifyLogin);  // run spotifyLogin at /login

app.get('/callback', spotifyCallback);  // run spotifyCallback at /callback

console.log('Listening on 8888');
app.listen(8888);