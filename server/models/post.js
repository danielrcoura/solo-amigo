var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var Post = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: './user.js' 
  },
  picture: String,
  audio: String,
  video: String,
  text_msg: String,
  location_lat: String, 
  location_lng: String,
  points: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

Post.plugin(autoInc, {id: "post_id"});
module.exports = mongoose.model('post', Post);
