const debug = require('debug')('write-api:controllers:umpires');
const mongoose = require('mongoose');
const Umpire = mongoose.model('umpire');

exports.getUmpires = async function(req, res, next) {
    debug('Received request to get all umpires');

    let umpires = [];
    try { umpires = await Umpire.find().limit(req.query.limit).skip(req.skip).exec() }
    catch(err) { return next(err) }

    umpires = umpires.map((u) => u.toObject());

    debug('Sending HTTP 200 containing %i umpires', umpires.length);
    return res.status(200).send(umpires);
}

exports.getUmpire = async function(req, res, next) {
    debug('Received request to get umpire. Params: %o', req.params);

    let umpire;
    try { umpire = await Umpire.findById(req.params.umpire).exec() }
    catch(err) { return next(err) }

    if(!umpire) {
        const message = 'No umpire with id ' + req.params.umpire + ' exists';
        debug('Sending HTTP 404: %s', message);
        return res.status(404).send(message)
    }

    debug('Sending HTTP 200');
    return res.status(200).send(umpire.toObject());
}

exports.createUmpire = async function(req, res, next) {
    debug('Received request to create umpire: %o', req.body);

    let umpireResult; 
    try { umpireResult = await Umpire.findOrCreate(req.body.name) }
    catch(err) { return next(err) }

    if(umpireResult.isNew) {
        debug('Sending HTTP 201 with umpire: %o', umpireResult.umpire);
        return res.status(201).send(umpireResult.umpire);
    }
    else {
        debug('Sending HTTP 200 with umpire: %o', umpireResult.umpire);
        return res.status(200).send(umpireResult.umpire);
    }
}
