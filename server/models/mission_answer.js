var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var MissionAnswer = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: './user.js' 
  }, _mission: { 
    type: Number, 
    ref: './mission.js' 
  },
  _group: { 
    type: Number, 
    ref: './group.js' 
  },
  status: {
    type: String,
    enum: ['Aprovado','Rejeitado','Pendente']
  },
  image: String,
  audio: String,
  video: String,
  text_msg: String,
  location_lat: String, 
  location_lng: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

MissionAnswer.plugin(autoInc, {id: "answer_id"});
module.exports = mongoose.model('mission_answer', MissionAnswer);