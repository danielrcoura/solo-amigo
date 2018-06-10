var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var Appointment = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: './user.js' 
  },
  name: String,
  description: String,
  place: String,
  type: String,
  start_date: Date,
  end_date: Date
});

Appointment.plugin(autoInc, {id: "appointment_id"});
module.exports = mongoose.model('appointment', Appointment);
