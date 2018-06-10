var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var TreeRequest = new Schema({
  _id: Number,
  _user: { 
    type: Number, 
    ref: '../user.js' 
  }, _type: { 
    type: Number,
    ref: '../tree_type.js'
  },
  tree_name: String,
  status: {
    type: String,
    enum: ['Aprovado','Rejeitado','Pendente', 'Plantada']
  },
  location_lat: String, 
  location_lng: String,
  quantity: Number,
  requester_name: String,
  requester_phone: String,
  place: String,
  photo: String,
  sidewalk_size: Number,
  street: String,
  complement: String,
  number: String,
  neighborhood: String,
  city: String,
  state: String,
  zipcode: String,
  updated_at: Date,
  request_date: {
    type: Date,
    default: Date.now
  },
  answer_date: Date,
  planting_date: Date
});

TreeRequest.plugin(autoInc, {id: "request_id"});
module.exports = mongoose.model('tree_request', TreeRequest);
