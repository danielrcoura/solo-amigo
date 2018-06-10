var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var Place = new Schema({
  _id: Number,
  name: String,
  updated_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

Place.plugin(autoInc, {id: "place_id"});
module.exports = mongoose.model('place', Place);
