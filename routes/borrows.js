const express = require('express');
const router = express.Router();

const { validateBorrow } = require('../models/Borrow');

const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');
const validateRequest = require('../middleware/validateRequest');
const catchErrors = require('../middleware/catchErrors');

const {
  getBorrows,
  getSingleBorrow,
  createBorrow
} = require('../controllers/borrowController');

router.get('/', authenticate, catchErrors(getBorrows));
router.get(
  '/:id',
  [authenticate, validateObjectId],
  catchErrors(getSingleBorrow)
);
router.post(
  '/',
  [authenticate, validateRequest(validateBorrow)],
  catchErrors(createBorrow)
);

module.exports = router;
