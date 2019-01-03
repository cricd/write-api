const debug = require('debug')('write-api:controllers:teams');
const mongoose = require('mongoose');
const Team = mongoose.model('team');
const Player = mongoose.model('player');

exports.getTeams = async function(req, res, next) {
    debug('Received request to get all teams');

    let teams = [];
    try { teams = await Team.find().limit(req.query.limit).skip(req.skip).exec() }
    catch(err) { return next(err) }

    teams = teams.map((t) => t.toObject());

    debug('Sending HTTP 200 containing %i teams', teams.length);
    return res.status(200).send(teams);
}

exports.getTeam = async function(req, res, next) {
    debug('Received request to get team. Params: %o', req.params);

    let team;
    try { team = await Team.findById(req.params.team).populate('players').exec() }
    catch(err) { return next(err) }

    if(!team) {
        const message = 'No team with id ' + req.params.team + ' exists';
        debug('Sending HTTP 404: %s', message);
        return res.status(404).send(message)
    }

    debug('Sending HTTP 200');
    return res.status(200).send(team.toObject());
}

exports.createTeam = async function(req, res, next) {
    debug('Received request to create team: %o', req.body);

    let teamResult; 
    try { teamResult = await Team.findOrCreate(req.body.name) }
    catch(err) { return next(err) }

    if(teamResult.isNew) {
        debug('Sending HTTP 201 with team: %o', teamResult.team);
        return res.status(201).send(teamResult.team);
    }
    else {
        debug('Sending HTTP 200 with team: %o', teamResult.team);
        return res.status(200).send(teamResult.team);
    }
}

exports.addPlayerToTeam = async function(req, res, next) {
    debug('Received request to add player to team. Params: %o. Body: %o', req.params, req.body);

    let playerResult;
    try { playerResult = await Player.findOrCreate(req.body.name); }
    catch(err) { return next(err) }

    let teamResult; 
    try { teamResult = await Team.addPlayerToTeam(req.params.team, playerResult.player.id) }
    catch(err) { return next(err) }

    if(playerResult.isNew) {
        debug('Sending HTTP 201 with player: %o', playerResult.player);
        return res.status(201).send(playerResult.player);
    }
    else {
        debug('Sending HTTP 200 with player: %o', playerResult.player);
        return res.status(200).send(playerResult.player);
    }
}
