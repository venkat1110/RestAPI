const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { categorySchema } = require('../models/Category');

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  category: {
    type: categorySchema,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    max: 30
  },
  failedReturnFee: {
    type: Number,
    required: true,
    min: 0,
    max: 500
  }
});

function validateBook(book) {
  const schema = {
    title: Joi.string().min(5).max(50).required(),
    categoryId: Joi.objectId().required(),
    stock: Joi.number().min(0).max(30).required(),
    failedReturnFee: Joi.number().min(0).max(500).required()
  };

  return Joi.validate(book, schema);
}

exports.Book = mongoose.model('Book', bookSchema);
exports.validateBook = validateBook;
