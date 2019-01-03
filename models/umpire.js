const debug = require('debug')('write-api:models:umpire');
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

        let existingUmpire;
        try { 
            debug('Checking for existing duplicate umpires');
            existingUmpire = await model.findOne({ name }).exec() 
        }
        catch(err) { 
            debug('Problem when checking for duplicate umpire: %o', err);
            throw { statusCode: 500, message: err} 
        }

        if(existingUmpire) {
            debug('Found existing duplicate umpire: %o', existingUmpire);
            return { isNew: false, umpire: existingUmpire.toObject() }
        }

        let newUmpire = new model({ name });
        try { 
            debug('Attempting to save new umpire');
            newUmpire = await newUmpire.save();
        }
        catch(err) { 
            debug('Problem when saving umpire: %o', err);
            throw { statusCode: 500, message: err} 
        }

        debug('Successfully saved umpire with id: %s', newUmpire.id);
        return { isNew: true, umpire: newUmpire.toObject() }
    },
}

schema.set('toObject', { transform: (o) => { return { id: o._id, name: o.name } }});
const model = new mongoose.model('umpire', schema);

module.exports = { schema, model }