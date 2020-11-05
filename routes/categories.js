const express = require('express');
const router = express.Router();

const { validateCategory } = require('../models/Category');

const authenticate = require('../middleware/authenticate');
const validateObjectId = require('../middleware/validateObjectId');
const validateRequest = require('../middleware/validateRequest');
const catchErrors = require('../middleware/catchErrors');

const {
  getCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

router.get('/', catchErrors(getCategories));
router.get('/:id', validateObjectId, catchErrors(getSingleCategory));
router.post(
  '/',
  [authenticate, validateRequest(validateCategory)],
  catchErrors(createCategory)
);
router.put(
  '/:id',
  [authenticate, validateObjectId, validateRequest(validateCategory)],
  catchErrors(updateCategory)
);
router.delete(
  '/:id',
  [authenticate, validateObjectId],
  catchErrors(deleteCategory)
);

module.exports = router;
