module.exports = validateFunc => {
  return function(req, res, next) {
    const { error } = validateFunc(req.body);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }

    next();
  };
};
