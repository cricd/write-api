const debug = require('debug')('write-api:models:player');
const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

schema.statics = {
    findOrCreate: async function(name) {
        if (!name) {
            var message = 'Name is a required field';
            throw { statusCode: 400, message };
        } 

        let existingPlayer;
        try { 
            debug('Checking for existing players with the same name: %s', name);
            existingPlayer = await model.findOne({ name }).exec() 
        }
        catch(err) {
            debug('Problem when checking for existing players: %o', err);
            throw { statusCode: 500, message: err}
        }
        
        if(existingPlayer) {
            debug('Found existing player: %o', existingPlayer);
            return { isNew: false, player: existingPlayer.toObject() }
        }

        let newPlayer = new model({ name });
        try { 
            debug('Attempting to save new player');
            newPlayer = await newPlayer.save();
        }
        catch(err) { 
            debug('Problem when saving player: %o', err);
            throw { statusCode: 500, message: err} 
        }
 
        debug('Successfully saved player with id: %s', newPlayer.id);
        return { isNew: true, player: newPlayer.toObject() }
    }
}

schema.set('toObject', { transform: (o) => { return { id: o._id, name: o.name } }});
const model = mongoose.model('player', schema);

module.exports = { schema, model };