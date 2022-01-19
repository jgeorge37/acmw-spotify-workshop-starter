import express from 'express'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requestTokens, spotifyLogin } from './spotify-auth.js';
import { getUserData } from './spotify-data.js';

// create express app 
var app = express();
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(process.cwd() + '/views'))  // server static files from views dir
  .use(cors())  // enable cross-origin requests
  .use(cookieParser());  // enable reading of cookies in request object


app.get('/', function(req, res) {
  res.render('index');
});

app.get('/stats', function(req, res) {
  res.render('stats');
})

app.get('/login', spotifyLogin);

app.get('/callback', function(req, res) {
  requestTokens(req, res);
});


console.log('Listening on 8888');
app.listen(8888);