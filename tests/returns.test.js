const request = require('supertest');
const moment = require('moment');
const mongoose = require('mongoose');

const { connectTestDB, startConnection, closeConnection } = require('./helper/test_helper');
const { User } = require('../models/User');
const { Book } = require('../models/Book');
const { Borrow } = require('../models/Borrow');

let server;

describe('POST /api/returns', () => {
  beforeAll(() => {
    connectTestDB();
    server = startConnection();
  });

  afterAll(async () => {
    await closeConnection(server);
  });

  let borrowId;
  let borrow;
  let book;
  let token;

  const run = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth', token)
      .send({ borrowId });
  };

  beforeEach(async () => {
    book = new Book({ 
      title: 'title 1',
      category: { name: 'category 1'},
      stock: 2,
      failedReturnFee: 50
    });
    await book.save();

    borrow = new Borrow({
      borrower: {
        firstName: 'first',
        lastName: 'last',
        email: 'mail@test.com',
        phone: '123-12-12'
      },
      book: {
        _id: book._id,
        title: 'title 1',
        failedReturnFee: 50
      }
    });
    borrow.setDueDate();

    await borrow.save();

    borrowId = borrow._id;
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await Promise.all([Book.remove({}), Borrow.remove({})]);
  });

  it('should set the dateReturned if it is valid', async () => {
    await run();

    const borrowInDB = await Borrow.findById(borrowId);
    const diff = new Date() - borrowInDB.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should set penaltyFee to 0 if the book was returned within 2 days', async () => {
    await run();

    const borrowInDB = await Borrow.findById(borrowId);

    expect(borrowInDB.penaltyFee).toBe(0);
  });

  it('should set penaltyFee based on failedReturnFee of book (per day) if it was returned after 2 days', async () => {
    borrow.dueDate = moment() 
      .subtract(2, 'days')
      .toDate();

    await borrow.save();
    await run();

    const borrowInDB = await Borrow.findById(borrowId);

    expect(borrowInDB.penaltyFee).toBe(100);
  });

  it('should increment the book stock if return is valid', async () => {
    await run();

    const bookInDB = await Book.findById(book._id);

    expect(bookInDB.stock).toBe(book.stock + 1);
  });

  it('should return the borrow if request is valid', async () => {
    const res = await run();

    const resBodyProps = Object.keys(res.body);
    const expectedArrayProps = [
      '_id',
      'borrower',
      'book',
      'dateBorrowed',
      'dueDate',
      'penaltyFee'
    ];

    expect(res.status).toBe(200);
    expect(resBodyProps).toEqual(expect.arrayContaining(expectedArrayProps));
  });

  it('should return 401 if the user is not logged in', async () => {
    token = '';

    const res = await run();

    expect(res.status).toBe(401);
  });

  it('should return 400 if borrowId is not provided', async () => {
    borrowId = '';

    const res = await run();

    expect(res.status).toBe(400);
  });

  it('should return 404 if the borrow not found', async () => {
    borrowId = mongoose.Types.ObjectId();

    const res = await run();

    expect(res.status).toBe(404);
  });

  it('should return 400 if return already processed', async () => {
    borrow.dateReturned = new Date();
    await borrow.save();

    const res = await run();

    expect(res.status).toBe(400);
  });
});