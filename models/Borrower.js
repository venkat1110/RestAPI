const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const borrowerSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  lastName: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  age: {
    type: Number,
    min: 8,
    max: 100,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    minlength: 10,
    maxlength: 100
  },
  address: {
    type: String,
    trim: true,
    minlength: 10,
    maxlength: 100,
    required: true
  },
  phone: {
    type: String,
    minlength: 7,
    maxlength: 20,
    required: true
  }
});

function validateBorrower(borrower) {
  const schema = {
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    age: Joi.number().min(8).max(100).required(),
    gender: Joi.string().required(),
    email: Joi.string().min(10).max(100).email().required(),
    address: Joi.string().min(10).max(100).required(),
    phone: Joi.string().min(7).max(20).required()
  };

  return Joi.validate(borrower, schema);
}

exports.Borrower = mongoose.model('Borrower', borrowerSchema);
exports.validateBorrower = validateBorrower;