var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var Quiz = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: './user.js' 
  },
  title: String,
  description: String,
  points: Number,
  secret_code: String,
  is_public: Boolean,
  single_answer: {
    type: Boolean,
    default: true
  },
  alternative_a: String,
  alternative_b: String,
  alternative_c: String,
  alternative_d: String,
  alternative_e: String,
  correct_answer: String,
  start_time: {
    type: Date,
    default: Date.now
  },
  end_time: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

Quiz.plugin(autoInc, {id: "quiz_id"});
module.exports = mongoose.model('quiz', Quiz);
