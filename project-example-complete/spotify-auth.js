/*
Adapted from Spotify's authorization code flow example
https://github.com/spotify/web-api-auth-examples/blob/master/authorization_code/app.js
*/

import { stringify } from 'querystring';
import request from 'request';
import { getUserData } from './spotify-data.js';

const CLIENT_ID = "";  // your app's client ID
const CLIENT_SECRET = "";  // your app's client secret
const REDIRECT_URI = "http://localhost:8888/callback";  // your app's redirect URI

const STATE_KEY = 'spotify_auth_state';
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

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
  const scope = "";

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
function requestTokens(req, res) {
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
    const result = [];
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {  // if request successful
        // get tokens from response
        const accessToken = body.access_token;
        const refreshToken = body.refresh_token;
        getUserData(accessToken);
        res.redirect('/stats');
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    })
    return result;
  }
}

export {spotifyLogin, requestTokens};