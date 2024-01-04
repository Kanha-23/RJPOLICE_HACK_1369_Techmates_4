const mongoose = require('mongoose');

const complainFormSchema = new mongoose.Schema({
  name: { 
    type: String,
    // required: true
  },
  number: {
    type: String, // Assuming the phone number can be stored as a string
    // required: true
  },
  email: {
    type: String,
    // required: true
  },
  date: {
    type: Date,  
    // required: true 
  },
  loc: {
    type: String,
    // required: true
  },
  pin: {
    type: String,
    // required: true
  },
  city: {
    type: String,
    // required: true
  },
  state: {
    type: String,
    // required: true
  },
  country: {
    type: String,
    // required: true
  },
  dis: {
    type: String,
    // required: true
  },
  people: {
    type: Number,
    // required: true
  },
  identityProof: {
    type: String,
    enum: ['aadhar', 'pan', 'voterID'],
    // required: true
  },
  
  proof: {
    type: String, 
  }
});

const Complain = mongoose.model("Complain", complainFormSchema);

module.exports = Complain;
