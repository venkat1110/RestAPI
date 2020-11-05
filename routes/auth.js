const Joi = require('joi');
const express = require('express');
const router = express.Router();

const catchErrors = require('../middleware/catchErrors');
const validateRequest = require('../middleware/validateRequest');

const { login } = require('../controllers/authController');

router.post('/', validateRequest(validateInput), catchErrors(login)); 

function validateInput(input) {
  const schema = {
    email: Joi.string().min(10).max(100).email().required(),
    password: Joi.string().min(6).max(255).required()
  };

  return Joi.validate(input, schema);
}

module.exports = router;