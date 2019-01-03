const debug = require('debug')('write-api:models:match');
const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    homeTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team',
        required: true
    },
    awayTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    numberOfInnings: {
        type: Number,
        required: true,
        default: 1
    },
    numberOfOvers: {
        type: Number,
        default: 0
    },
    location: String,
    venue: String,
    umpires: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'umpire'
    }]
});

schema.statics = {
    create: async function (match) {
        debug('Validating match: %o', match);
        const validationErrors = new model(match).validateSync();
        if (validationErrors) {
            debug('Found validation errors: %o', validationErrors);
            throw { statusCode: 400, message: validationErrors }
        }

        let existingMatch;
        try {
            debug('Checking for existing duplicate matches');
            existingMatch = await model.findOne
                ({
                    startDate: match.startDate,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam
                })
                .populate('homeTeam')
                .populate('awayTeam')
                .populate('umpires')
                .exec()
        }
        catch (err) {
            debug('Problem when checking for duplicate matches: %o', err);
            throw { statusCode: 500, message: err }
        }

        if (existingMatch) {
            debug('Found existing duplicate match: %o', existingMatch);
            return { isNew: false, match: existingMatch.toObject() }
        }

        let newMatch = new model(match);
        try {
            debug('Attempting to save new match');
            newMatch = await newMatch.save();
            newMatch = await model.populate(newMatch, { path: 'homeTeam awayTeam umpires' });
        }
        catch (err) {
            debug('Problem when saving match: %o', err);
            throw { statusCode: 500, message: err }
        }

        debug('Successfully saved match with id: %s', newMatch.id);
        return { isNew: true, match: newMatch.toObject() }
    }
}

schema.set('toObject', {
    transform: (o) => {
        let result;
        try {
            result = {
                id: o.id,
                homeTeam: { id: o.homeTeam.id, name: o.homeTeam.name },
                awayTeam: { id: o.awayTeam.id, name: o.awayTeam.name },
                startDate: o.startDate,
                numberOfInnings: o.numberOfInnings,
                numberOfOvers: o.numberOfOvers,
                location: o.location,
                venue: o.venue,
                umpires: o.umpires.map((u) => { return { id: u.id, name: u.name } })
            }
        }
        catch (err) {
            const message = 'Problem trying to transform match object. Probably caused by referential integrity: ' + err;
            debug(message);
            throw (message);
        }
        return result;
    }
});
const model = mongoose.model('match', schema);

module.exports = { schema, model }