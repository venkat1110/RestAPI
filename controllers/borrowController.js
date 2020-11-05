const { Borrow } = require('../models/Borrow');
const { Borrower } = require('../models/Borrower');
const { Book } = require('../models/Book');

exports.getBorrows = async (req, res) => {
  const borrowList = await Borrow.find().sort('-dateBorrowed');
  res.send(borrowList);
};

exports.getSingleBorrow = async (req, res) => {
  const borrow = await Borrow.findById(req.params.id);

  if (!borrow)
    return res
      .status(404)
      .send({ error: 'The borrow with the given id was not found' });

  res.send(borrow);
};

exports.createBorrow = async (req, res) => {
  const { borrowerId, bookId } = req.body;

  const borrower = await Borrower.findById(borrowerId);
  if (!borrower) return res.status(400).send({ error: 'Invalid borrower' });

  const book = await Book.findById(bookId);
  if (!book) return res.status(400).send({ error: 'Invalid book' });

  if (book.stock === 0)
    return res.status(400).send({ error: 'Book not in stock' });

  const borrow = new Borrow({
    borrower: {
      _id: borrower.id,
      firstName: borrower.firstName,
      lastName: borrower.lastName,
      email: borrower.email,
      phone: borrower.phone
    },
    book: {
      _id: book.id,
      title: book.title,
      failedReturnFee: book.failedReturnFee
    }
  });
  borrow.setDueDate();

  const bookPromise = Book.update(
    { _id: book._id },
    { $inc: { stock: -1 } }
  ).exec();

  const [borrowRes] = await Promise.all([borrow.save(), bookPromise]);

  res.send(borrowRes);
};
