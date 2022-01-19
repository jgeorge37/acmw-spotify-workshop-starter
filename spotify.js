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
  // TODO: store string of random numbers and letters in cookie to compare later

  // TODO: define the scope of authorization being requested

  // TODO: redirect to spotify authorization
}

// called when spotify makes request to the /callback endpoint
// requests access and refresh tokens
function spotifyCallback(req, res) {
  const code = ""; // TODO: get authorization code from spotify that can be exchanged for an access token
  const state = "";  // TODO: get the value of the state sent by spotify
  const storedState = "";  // TODO: get the state stored in cookie earlier

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
        redirect_uri: REDIRECT_URI,  // redirect to /callback
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
        // TODO: get tokens from response and save in session storage
        // TODO: get user-specific data (top tracks)
      } else {
        res.redirect('/#' +
          stringify({
            error: 'invalid_token'
          }));
      }
    })
  }
}

// called once the application has access token for Spotify API
// gets user's recent top 5 songs
function getUserData(req, res) {
  // TODO: set up request info for top tracks
  const options = {};
  /*
   TODO: make request to spotify API for top tracks, then minify, store in session, and redirect to /profile
   */
}

// pulls values of interest from list of items
// names of artists, albums, tracks
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
