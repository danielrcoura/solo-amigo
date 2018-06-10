var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var Group = new Schema({
  _id: Number,
  name: String,
  description: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

Group.plugin(autoInc, {id: "group_id"});
module.exports = mongoose.model('group', Group);
