var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var Reaction = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: './user.js' 
  }, 
  _post_reacted: { 
    type: Number, 
    ref: './post.js' 
  },
  points: {
    type: Number,
    default: 1
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

Reaction.plugin(autoInc, {id: "reaction_id"});
module.exports = mongoose.model('reaction', Reaction);