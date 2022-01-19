/*
Adapted from Spotify's authorization code flow example
https://github.com/spotify/web-api-auth-examples/blob/master/authorization_code/app.js
*/

import { stringify } from 'querystring';
import request from 'request';


const CLIENT_ID = process.env.CLIENT_ID;  // your app's client ID
const CLIENT_SECRET = process.env.CLIENT_SECRET;  // your app's client secret
const REDIRECT_URI = "http://localhost:8888/callback";  // your app's redirect URI

const STATE_KEY = 'spotify_auth_state';

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";


// generates string of random numbers and letters
function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// requests authorization
function spotifyLogin(req, res) {
  // store string of random numbers and letters in cookies to compare later
  const state = generateRandomString(16);
  res.cookie(STATE_KEY, state);

  // define the scope of authorization being requested
  const scope = "user-top-read";

  // send authorization request to spotify
  res.redirect(SPOTIFY_AUTH_URL + "?" +
    stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    }))
}

// called when spotify makes request to the /callback endpoint
// requests access and refresh tokens
function spotifyCallback(req, res) {
  const code = req.query.code || null;  // authorization code from spotify that can be exchanged for an access token
  const state = req.query.state || null;  // the value of the state sent by spotify
  const storedState = req.cookies ? req.cookies[STATE_KEY] : null;  // the state stored in cookies earlier

  if (state === null || state !== storedState) {  // different state than stored indicates possible forgery
    res.redirect('/#' + stringify({error: 'state_mismatch'}));  // redirect to home
  } else { 
    // clear state cookie
    res.clearCookie(STATE_KEY);
    // set up request info to get tokens from Spotify
    const authOptions = {
      url: SPOTIFY_TOKEN_URL,
      form: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
      },
      json: true
    };
    // send POST request to Spotify to get tokens
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {  // if request successful
        // get tokens from response and save in session storage
        req.session.accessToken = body.access_token; 
        req.session.refreshToken = body.refresh_token;
        getUserData(req, res);
      } else {
        res.redirect('/#' +
          stringify({
            error: 'invalid_token'
          }));
      }
    })
  }
}

function getUserData(req, res) {
  const options = {
    url: SPOTIFY_API_BASE_URL + "/me/top/tracks?" + stringify({
      limit: 5,  // top 5
      time_range: "short_term"  // about the last 4 weeks
    }),
    headers: { 'Authorization': 'Bearer ' + req.session.accessToken },
    json: true
  };
  request.get(options, function(error, response, body) {
    const topTracks = minifyItems(body.items);
    req.session.topTracks = topTracks;
    res.redirect('/profile');
  })
}

function minifyItems(items) {
  const newItems = [];
  items.forEach((item) => {
    const newItem = {};
    if (item['name']) newItem['name'] = item['name'];  // save name of item (track, artist, etc.)
    if (item['album']) newItem['album'] = item['album']['name'];  // save album name
    if (item['artists']) newItem['artists'] = minifyItems(item['artists']).flatMap(artist => artist['name']);  // save artist names
    newItems.push(newItem);
  })
  return newItems;
}

export {spotifyLogin, spotifyCallback};
