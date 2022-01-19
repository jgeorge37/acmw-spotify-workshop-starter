import express from 'express'; 
import expressSession from 'express-session';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { spotifyCallback, spotifyLogin } from './spotify.js';

// create express app 
var app = express();
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(process.cwd() + '/views'))  // server static files from views dir
  .use(cors())  // enable cross-origin requests
  .use(cookieParser())  // enable reading of cookies in request object
  .use(expressSession({  // enable session storage
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })) 

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/profile', function(req, res) {
  const topTracks = req.session.topTracks;
  res.render('profile', {
    tracks: topTracks
  });
})

app.get('/login', spotifyLogin);

app.get('/callback', spotifyCallback);

console.log('Listening on 8888');
app.listen(8888);