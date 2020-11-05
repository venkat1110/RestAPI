const _ = require('lodash');
const bcrypt = require('bcrypt');

const { User } = require('../models/User');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).send({ error: 'Invalid email or password' });

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return res.status(400).send({ error: 'Invalid email or password' });

  const token = user.generateAuthToken();
  res.header('x-auth', token).send(_.pick(user, ['_id', 'username', 'email']));
};
