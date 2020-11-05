module.exports = (err, req, res, next) => {
  console.log(err.message, err);

  res.status(500).send({ error: 'Something failed' });
};
