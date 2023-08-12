const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default:Date.now
  },
  fromLocation: {
    type: String,
    required: true
  },
  toLocation:{
    type:String,
    required:true
  },
  email: {
    type: String,
    required : true,
    trim:true
  },
  mobile:{
    type:String,
    required:true,
  },
  created:{
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});


let JourneyDB = mongoose.model('JourneyDB' , journeySchema);

module.exports = JourneyDB;