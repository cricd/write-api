const debug = require('debug')('write-api:models:matchEvent');
const mongoose = require('mongoose');
const hash = require('object-hash');
const _ = require('underscore');

let schema = new mongoose.Schema({
    hash: {
        type: String,
        required: true
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'match',
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ['delivery', 'noBall', 'wide', 'bye', 'legBye', 'bowled', 'timedOut', 'caught', 'handledBall', 'doubleHit', 'hitWicket', 'lbw', 'obstruction', 'runOut', 'stumped', 'penaltyRuns', 'retired']
    },
    timestamp: {
        type: Date,
        required: true
    },
    bowler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player',
    },
    batsmen: {
        striker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'player',
        },
        nonStriker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'player',
        }
    },
    ball: {
        battingTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'team',
            required: true
        },
        fieldingTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'team',
            required: true
        },
        innings: {
            type: Number,
            required: true,
            min: 1
        },
        over: {
            type: Number,
            required: true,
            min: 0
        },
        ball: {
            type: Number,
            required: true,
            min: 1,
            max: 6
        },
        delivery: {
            type: Number,
            required: true,
            min: 1
        }
    },
    runs: Number,
    batsman: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player',
    },
    fielder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'player',
    },
    didCross: Boolean
});

schema.statics = {
    createMatchEvents: async function (matchEvents) {
        debug('Hashing %i incoming matchEvents', matchEvents.length);
        matchEvents = matchEvents.map((e) => { return { hash: hash(e), ...e }});

        debug('Validating %i matchEvents', matchEvents.length);
        let validationErrors;
        const allValid = _(matchEvents).every((e) => { 
            validationErrors = new model(e).validateSync();
            if(validationErrors) return false;
            else return true;
         });
         
         if(!allValid) {
             const message = 'Validation errors found in matchEvents: %o' + JSON.stringify(validationErrors);
             debug(message);
             throw { statusCode: 400, message }
         }

        let newEvents = [];
        try {
            debug('Saving %i matchEvents', matchEvents.length);
            const result = await model.create(matchEvents);
            newEvents = result.map((e) => new model(e).toObject() );
        }
        catch (err) {
            debug('Problem when saving matchEvents: %o', err);
            throw { statusCode: 500, message: err }
        }

        debug('Successfully saved $i matchEvents', newEvents.length);
        return newEvents;
    }
}

schema.set('toObject', {
    transform: (o) => {
        let result = {};
        try {
            result.id = o._id;
            result.match = o.match._id;
            result.eventType = o.eventType;
            result.timestamp = o.timestamp;
            if (o.bowler) result.bowler = { id: o.bowler._id, name: o.bowler.name };
            if (o.batsmen) result.batsmen = {
                striker: { id: o.batsmen.striker._id, name: o.batsmen.striker.name },
                nonStriker: { id: o.batsmen.nonStriker._id, name: o.batsmen.nonStriker.name }
            };
            result.ball = {
                battingTeam: { id: o.ball.battingTeam._id, name: o.ball.battingTeam.name },
                fieldingTeam: { id: o.ball.fieldingTeam._id, name: o.ball.fieldingTeam.name },
                innings: o.ball.innings,
                over: o.ball.over,
                ball: o.ball.ball,
                delivery: o.ball.delivery
            };
            result.runs = o.runs;
            if(o.batsman) result.batsman = { id: o.batsman._id, name: o.batsman.name };
            if(o.fielder) result.fielder = { id: o.fielder._id, name: o.fielder.name };
            if(o.didCross) result.didCross = o.didCross;
        }
        catch(err) {
            const message = 'Problem trying to transform matchEvent object. Probably caused by referential integrity: ' + err;
            debug(message);
            throw(message);
        }

        return result;
    }
});
const model = new mongoose.model('matchEvent', schema);

module.exports = { schema, model }