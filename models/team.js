const debug = require('debug')('write-api:models:team');
const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'player',
    }]
});

schema.statics = {
    findOrCreate: async function(name) {
        if (!name) {
            var message = 'Name is a required field';
            throw { statusCode: 400, message };
        } 

        let existingTeam;
        try { 
            debug('Checking for existing duplicate teams');
            existingTeam = await model.findOne({ name }).exec() 
        }
        catch(err) { 
            debug('Problem when checking for duplicate teams: %o', err);
            throw { statusCode: 500, message: err} 
        }
        
        if(existingTeam) {
            debug('Found existing duplicate team: %o', existingTeam);
            return { isNew: false, team: existingTeam.toObject() }
        }

        let newTeam = new model({ name });
        try { 
            debug('Attempting to save new team');
            newTeam = await newTeam.save();
        }
        catch(err) { 
            debug('Problem when saving team: %o', err);
            throw { statusCode: 500, message: err} 
        }

        debug('Successfully saved team with id: %s', newTeam.id);
        return { isNew: true, team: newTeam.toObject() }
    },

    addPlayerToTeam: async function(team, player) {
        let updatedTeam; 
        try { 
            debug('Attempting to add player %s to team %s', player, team);
            updatedTeam = await model.findByIdAndUpdate(
                team,
                { $addToSet: { players: [player] } },
                { new: true }
            )
            .populate('players')
            .exec(); 
        }
        catch(err) { 
            debug('Problem when adding player to team: %o', err);
            throw err 
        }

        if(!updatedTeam) { 
            const message = 'No team with id ' + team + ' exists';
            debug(message);
            throw { statusCode: 404, message } 
        }

        debug('Successfully added player to team');
        return updatedTeam.toObject();
    }
}

schema.set('toObject', { transform: (o) => { 
    debug('Transforming player object');
    let result = {};

    result.id = o._id;
    result.name = o.name;
    if(o.players) result.players = o.players.map((p) => { return { id: p._id, name: p.name } })

    debug('Succesfully transformed player object');
    return result;
}});
const model = mongoose.model('team', schema);

module.exports = { schema, model };