const moment = require('moment');
const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const borrowSchema = new Schema({
  borrower: {
    type: new Schema({
      firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
      },
      lastName: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 50,
        required: true
      },
      email: {
        type: String,
        trim: true,
        minlength: 10,
        maxlength: 100
      },
      phone: {
        type: String,
        minlength: 7,
        maxlength: 20,
        required: true
      }
    }),
    required: true
  },
  book: {
    type: new Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 50
      },
      failedReturnFee: {
        type: Number,
        required: true,
        min: 0,
        max: 500
      }
    }),
    required: true
  },
  dateBorrowed: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  dateReturned: {
    type: Date
  },
  penaltyFee: {
    type: Number,
    min: 0
  }
});

borrowSchema.methods.setDueDate = function() {
  this.dueDate = moment(this.dateBorrowed)
    .add(2, 'days')
    .toDate();
};

borrowSchema.methods.setReturn = function() {
  this.dateReturned = new Date();

  const borrowDays = moment().diff(this.dueDate, 'days');

  if (borrowDays > 0) {
    this.penaltyFee = borrowDays * this.book.failedReturnFee;
  } else {
    this.penaltyFee = 0;
  }
};

function validateBorrow(borrow) {
  const schema = {
    borrowerId: Joi.objectId().required(),
    bookId: Joi.objectId().required()
  };

  return Joi.validate(borrow, schema);
}

exports.Borrow = mongoose.model('Borrow', borrowSchema);
exports.validateBorrow = validateBorrow;
