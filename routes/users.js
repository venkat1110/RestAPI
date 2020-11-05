const express = require('express');
const router = express.Router();

const { validateUser } = require('../models/User');

const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const catchErrors = require('../middleware/catchErrors');

const { registerUser, getCurrentUser } = require('../controllers/userController');

router.post('/', validateRequest(validateUser), catchErrors(registerUser));
router.get('/me', authenticate, catchErrors(getCurrentUser));

module.exports = router;
