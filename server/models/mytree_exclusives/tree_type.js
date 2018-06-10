var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var TreeType = new Schema({
  _id: Number,
  name: String,
  description: String,
  ammount_available: Number,
  photo: String,
  _places:  [{ 
    type: Schema.Types.Mixed,
    ref: './place.js' 
  }]
});

TreeType.plugin(autoInc, {id: "type_id"});
module.exports = mongoose.model('tree_type', TreeType);
