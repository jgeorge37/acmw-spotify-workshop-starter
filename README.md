# ACM-W Spotify API Workshop Project Example (Starter)

## Installation for local development
0. Create a Spotify developer account and register a new application
1. Download the repository
2. [Install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) if not already installed
3. Run ```npm install``` from the root directory
4. Create an .env file in the root directory with the following:
~~~~
# Spotify client ID of this app
CLIENT_ID={Spotify client ID}

# Spotify client secret of this app
CLIENT_SECRET={Spotify client secret}

# Secret string for express-session
SESSION_SECRET={string of random numbers and letters}
~~~~
The Spotify client ID and client secret can be found by selecting the newly registered application in the [Spotify developer dashboard](https://developer.spotify.com/dashboard/applications).

## Usage
Run ```node app.js```.
