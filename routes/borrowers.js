const express = require('express');
const router = express.Router();

const { validateBorrower } = require('../models/Borrower');

const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');
const validateRequest = require('../middleware/validateRequest');
const catchErrors = require('../middleware/catchErrors');

const {
  getBorrowers,
  getSingleBorrower,
  createBorrower,
  updateBorrower,
  deleteBorrower
} = require('../controllers/borrowerController');

router.get('/', authenticate, catchErrors(getBorrowers));
router.get(
  '/:id',
  [authenticate, validateObjectId],
  catchErrors(getSingleBorrower)
);
router.post(
  '/',
  [authenticate, validateRequest(validateBorrower)],
  catchErrors(createBorrower)
);
router.put(
  '/:id',
  [authenticate, validateObjectId, validateRequest(validateBorrower)],
  catchErrors(updateBorrower)
);
router.delete(
  '/:id',
  [authenticate, validateObjectId],
  catchErrors(deleteBorrower)
);

module.exports = router;
