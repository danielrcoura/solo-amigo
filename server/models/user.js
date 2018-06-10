// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoInc   = require('mongoose-sequence')(mongoose);

var User = new Schema({
  _id: Number,
  name: {
    type: String,
    required: true
  },
  picture: String,
  email: {
  	type: String,
  	lowercase: true,
    unique: true,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  institution: String,
  password: {
    type: String,
    required: true
  },
  new_password: String,
  birth: Date,
  sex: String,
  phone: String,
  street: String,
  complement: String,
  number: Number,
  neighborhood: String,
  city: String,
  state: String,
  zipcode: String,
  points: {
  	type: Number,
    default: 0
  },
  sec_points: {
    type: Number,
    default: 0
  },
  request_limit: {
    type: Number,
    default: 5
  },
  banned_until: Date,
  created_at: {
    type: Date,
    default: Date.now
  }
});

User.plugin(autoInc, {id: "user_id"});
module.exports = mongoose.model('users', User);