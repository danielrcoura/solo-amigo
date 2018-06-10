var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var Mission = new Schema({
  _id: Number,
  name: String,
  _user: { 
    type: Number, 
    ref: './user.js' 
  },
  description: String,
  points: Number,
  secret_code: String,
  is_public: Boolean,
  is_grupal: Boolean,
  single_answer: {
    type: Boolean,
    default: true
  },
  has_image: Boolean,
  has_audio: Boolean,
  has_video: Boolean,
  has_text: Boolean,
  has_geolocation: Boolean,
  end_message: String,
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: Date,
  created_at: {
    type: Date,
    default: Date.now
  }
});

Mission.plugin(autoInc, {id: "mission_id"});
module.exports = mongoose.model('mission', Mission);