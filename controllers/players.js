const debug = require('debug')('write-api:controllers:players');
const mongoose = require('mongoose');
const Player = mongoose.model('player');

exports.getPlayers = async function(req, res, next) {
    debug('Received request to get all players');

    let players = [];
    try { players = await Player.find().limit(req.query.limit).skip(req.skip).exec() }
    catch(err) { return next(err) }

    players = players.map((p) => p.toObject());
    
    debug('Sending HTTP 200 containing %i matches', players.length);
    return res.status(200).send(players);
}

exports.getPlayer = async function(req, res, next) {
    debug('Received request to get player. Params: %o', req.params);

    let player;
    try { player = await Player.findById(req.params.player).exec() }
    catch(err) { return next(err) }

    if(!player) {
        const message = 'No player with id ' + req.params.player + ' exists';
        debug('Sending HTTP 404: %s', message);
        return res.status(404).send(message)
    }

    debug('Sending HTTP 200');
    return res.status(200).send(player.toObject());
}