const debug = require('debug')('write-api:controllers:matchEvents');
const mongoose = require('mongoose');
const MatchEvent = mongoose.model('matchEvent');
const _ = require('underscore');

exports.createMatchEvents = async function(req, res, next) {
    const eventsToSave = Array.isArray(req.body) ? req.body : [req.body];
    debug('Received request to create %i matchEvents', eventsToSave.length);

    let newEvents = []; 
    try { newEvents = await MatchEvent.createMatchEvents(eventsToSave) }
    catch(err) { return next(err) }

    debug('Sending HTTP 201 with %i matchEvents', newEvents.length);
    return res.status(201).send(newEvents);
}

exports.getEventsForMatch = async function(req, res, next) {
    debug('Received request to get events for match. Params: %o', req.params);
    
    let events = [];
    try { events = await MatchEvent.find({ match: req.params.match })
            .populate('bowler')
            .populate('batsmen.striker')
            .populate('batsmen.nonStriker')
            .populate('ball.battingTeam')
            .populate('ball.fieldingTeam')
            .populate('batsman')
            .populate('fielder')
            .sort({ 'ball.over': 1, 'ball.delivery': 1 })
            .exec();
        }
    catch(err) { return next(err) }

    events = _(events).uniq(false, (e) => { return e.hash }); // Filter out any duplicate hashes
    events = events.map((e) => e.toObject());

    debug('Sending HTTP 200 containing %i events', events.length);
    return res.status(200).send(events);
}

exports.getEventsForBatsman = async function(req, res, next) {
    debug('Received request to get events for batsman. Params: %o', req.params);
    
    let events = [];
    try { events = await MatchEvent.find(
            { $or: [{ "batsmen.striker": req.params.player}, { batsman: req.params.player }] })
            .populate('bowler')
            .populate('batsmen.striker')
            .populate('batsmen.nonStriker')
            .populate('ball.battingTeam')
            .populate('ball.fieldingTeam')
            .populate('batsman')
            .exec();
        }
    catch(err) { return next(err) }

    events = _(events).uniq(false, (e) => { return e.hash }); // Filter out any duplicate hashes
    events = events.map((e) => e.toObject());

    debug('Sending HTTP 200 containing %i events', events.length);
    return res.status(200).send(events);
}

exports.getEventsForBowler = async function(req, res, next) {
    debug('Received request to get events for bowler. Params: %o', req.params);
    
    let events = [];
    try { events = await MatchEvent.find({ bowler: req.params.player })
            .populate('bowler')
            .populate('batsmen.striker')
            .populate('batsmen.nonStriker')
            .populate('ball.battingTeam')
            .populate('ball.fieldingTeam')
            .populate('batsman')
            .exec();
        }
    catch(err) { return next(err) }

    events = _(events).uniq(false, (e) => { return e.hash }); // Filter out any duplicate hashes
    events = events.map((e) => e.toObject());

    debug('Sending HTTP 200 containing %i events', events.length);
    return res.status(200).send(events);
}