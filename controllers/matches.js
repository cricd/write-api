const debug = require('debug')('write-api:controllers:matches');
const mongoose = require('mongoose');
const Match = mongoose.model('match');

exports.getMatches = async function (req, res, next) {
    debug('Received request to get all matches');

    let matches = [];
    try {
        matches = await Match.find()
            .limit(req.query.limit)
            .skip(req.skip)
            .populate('homeTeam')
            .populate('awayTeam')
            .populate('umpires')
            .exec()
    }
    catch (err) { return next(err) }

    matches = matches.map((m) => m.toObject());

    debug('Sending HTTP 200 containing %i matches', matches.length);
    return res.status(200).send(matches);
}

exports.getMatch = async function (req, res, next) {
    debug('Received request to get match. Params: %o', req.params);

    let match;
    try {
        match = await Match.findById(req.params.match)
            .populate('homeTeam')
            .populate('awayTeam')
            .populate('umpires')
            .exec()
    }
    catch (err) { return next(err) }

    if (!match) {
        const message = 'No match with id ' + req.params.match + ' exists';
        debug('Sending HTTP 404: %s', message);
        return res.status(404).send(message)
    }

    debug('Sending HTTP 200');
    return res.status(200).send(match.toObject());
}

exports.createMatch = async function (req, res, next) {
    debug('Received request to create match: %o', req.body);

    let matchResult;
    try { matchResult = await Match.create(req.body) }
    catch (err) { return next(err) }

    if (matchResult.isNew) {
        debug('Sending HTTP 201 with match: %o', matchResult.match);
        return res.status(201).send(matchResult.match);
    }
    else {
        debug('Sending HTTP 200 with match: %o', matchResult.match);
        return res.status(200).send(matchResult.match);
    }
}