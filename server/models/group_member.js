var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var GroupMember = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: './user.js' 
  },
  _group: { 
    type: Number,
    ref: './group.js'
  },
  is_admin: Boolean,
  joined_at: {
    type: Date,
    default: Date.now
  }
});

GroupMember.plugin(autoInc, {id: "member_id"});
module.exports = mongoose.model('group_member', GroupMember);
