const { Borrower } = require('../models/Borrower');

exports.getBorrowers = async (req, res) => {
  const borrowerList = await Borrower.find().sort('lastName');
  res.send(borrowerList);
};

exports.getSingleBorrower = async (req, res) => {
  const borrower = await Borrower.findById(req.params.id);

  if (!borrower)
    return res
      .status(404)
      .send({ error: 'The borrower with the given id was not found' });

  res.send(borrower);
};

exports.createBorrower = async (req, res) => {
  const borrower = new Borrower(req.body);
  await borrower.save();

  res.send(borrower);
};

exports.updateBorrower = async (req, res) => {
  const borrower = await Borrower.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!borrower)
    return res
      .status(404)
      .send({ error: 'The borrower with the given id was not found' });

  res.send(borrower);
};

exports.deleteBorrower = async (req, res) => {
  const borrower = await Borrower.findByIdAndRemove(req.params.id);

  if (!borrower)
    return res
      .status(404)
      .send({ error: 'The borrower with the given id was not found' });

  res.send(borrower);
};
