const { Borrow } = require('../models/Borrow');
const { Book } = require('../models/Book');

exports.returnBook = async (req, res) => {
  const borrow = await Borrow.findById(req.body.borrowId);

  if (!borrow) return res.status(404).send({ error: 'borrow not found' });

  if(borrow.dateReturned) return res.status(400).send({ error: 'return already processed'});

  borrow.setReturn();

  const bookPromise = Book.update(
    { _id: borrow.book._id },
    { $inc: { stock: 1 } }
  ).exec();

  const [borrowRes] = await Promise.all([borrow.save(), bookPromise]);

  res.send(borrowRes);
};
