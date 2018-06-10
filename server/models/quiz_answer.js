var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var QuizAnswer = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: './user.js' 
  }, _quiz: { 
    type: Number, 
    ref: './quiz.js' 
  },
  answer: String,
  approved: Boolean,
  created_at: {
    type: Date,
    default: Date.now
  }
});

QuizAnswer.plugin(autoInc, {id: "quiz_answer_id"});
module.exports = mongoose.model('quiz_answer', QuizAnswer);