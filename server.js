const debug = require('debug')('write-api');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const paginate = require('express-paginate');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 3001;
const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/cricd';
const modelsPath = 'models';
const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS : 'http://localhost:8080';
const corsOptions = {
    origin: allowedOrigins
};

app.use(bodyParser.json());
app.use(paginate.middleware(100, 500));

// Import models
fs.readdirSync(modelsPath)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => {
    debug('Imported model: %s', file);
    require('./' + path.join(modelsPath, file))
  });

// Define routes
const playersController = require('./controllers/players');
app.get('/players', cors(corsOptions), playersController.getPlayers);
app.get('/players/:player', cors(corsOptions), playersController.getPlayer);

const teamsController = require('./controllers/teams');
app.get('/teams', cors(corsOptions), teamsController.getTeams);
app.get('/teams/:team', cors(corsOptions), teamsController.getTeam);
app.post('/teams', cors(corsOptions), teamsController.createTeam);
app.post('/teams/:team/players', cors(corsOptions), teamsController.addPlayerToTeam);

const umpiresController = require('./controllers/umpires');
app.get('/umpires', cors(corsOptions), umpiresController.getUmpires);
app.get('/umpires/:umpire', cors(corsOptions), umpiresController.getUmpire);
app.post('/umpires', cors(corsOptions), umpiresController.createUmpire);

const matchesController = require('./controllers/matches');
app.get('/matches', cors(corsOptions), matchesController.getMatches);
app.get('/matches/:match', cors(corsOptions), matchesController.getMatch);
app.post('/matches', cors(corsOptions), matchesController.createMatch);

const matchEventsController = require('./controllers/matchEvents');
app.post('/matchEvents', cors(corsOptions), matchEventsController.createMatchEvents);
app.get('/matches/:match/events', cors(corsOptions), matchEventsController.getEventsForMatch);
app.get('/players/:player/batting', cors(corsOptions), matchEventsController.getEventsForBatsman);
app.get('/players/:player/bowling', cors(corsOptions), matchEventsController.getEventsForBowler);

// Error handling middleware
app.use((error, req, res, next) => {
  debug('Handling error: %o', error);
  if (!error.statusCode) return res.status(500).send(error.toString());
  else if (error.statusCode) return res.status(error.statusCode).send(error.message.toString());

  next();
});

// Connect to Mongo DB
const connectWithRetry = () => {
  return mongoose.connect(dbUri, { useNewUrlParser: true}, (err) => {
    if (err) {
      debug('Failed to connect to mongo on startup - retrying in 5 sec...', err);
      setTimeout(connectWithRetry, 5000);
    }
    else debug('Succesfully connected to db');
  });
};
connectWithRetry();

// Start Express app
app.listen(port);
console.log('write-api listening on port %s..', port);


