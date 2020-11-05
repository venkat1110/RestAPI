const Joi = require('joi');
const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const catchErrors = require('../middleware/catchErrors');
const validateRequest = require('../middleware/validateRequest');

const { returnBook } = require('../controllers/returnController');

router.post(
  '/',
  [authenticate, validateRequest(validateReturn)],
  catchErrors(returnBook)
);

function validateReturn(input) {
  const schema = {
    borrowId: Joi.objectId().required()
  };

  return Joi.validate(input, schema);
}

module.exports = router;
