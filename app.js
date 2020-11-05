const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const cors = require('cors');

require('dotenv').config();

const auth = require('./routes/auth');
const books = require('./routes/books');
const categories = require('./routes/categories');
const users = require('./routes/users');
const borrowers = require('./routes/borrowers');
const borrows = require('./routes/borrows');
const returns = require('./routes/returns');
const error = require('./middleware/error');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/auth', auth);
app.use('/api/categories', categories);
app.use('/api/books', books);
app.use('/api/users', users);
app.use('/api/borrowers', borrowers);
app.use('/api/borrows', borrows);
app.use('/api/returns', returns);
app.use(error);

module.exports = app;
