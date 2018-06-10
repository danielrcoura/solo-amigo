var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var AppointmentRequest = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: './user.js' 
  },
  _appointment: {
    type: Number,
    ref: './appointment.js'
  },
  status: {
    type: String,
    enum: ['Aprovado','Rejeitado','Pendente']
  },
  message: String,
  updated_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  }
});

AppointmentRequest.plugin(autoInc, {id: "appointment_request_id"});
module.exports = mongoose.model('appointment_request', AppointmentRequest);
