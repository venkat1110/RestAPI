const moment = require('moment');
const request = require('supertest');
const mongoose = require('mongoose');

const { connectTestDB, startConnection, closeConnection } = require('./helper/test_helper');
const { Borrow } = require('../models/Borrow');
const { User } = require('../models/User');
const { Borrower } = require('../models/Borrower');
const { Book } = require('../models/Book');

let server;

describe('/api/borrows', () => {
  beforeAll(() => {
    connectTestDB();
    server = startConnection();
  });

  afterAll(async () => {
    await closeConnection(server);
  });

  afterEach(async () => {
    await Borrow.remove({});
  });

  describe('GET /', () => {
    it('should return all the borrows', async () => {
      const borrows = [
        {
          borrower: {
            firstName: 'first',
            lastName: 'last',
            email: 'test@mail.com',
            phone: '123-12-12'
          },
          book: {
            title: 'title 1',
            failedReturnFee: 50
          }
        },
        {
          borrower: {
            firstName: 'first 2',
            lastName: 'last 2',
            email: 'test2@mail.com',
            phone: '456-56-56'
          },
          book: {
            title: 'title 2',
            failedReturnFee: 50
          }
        }
      ];

      await Borrow.insertMany(borrows);
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get('/api/borrows')
        .set('x-auth', token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(borrow => borrow.borrower.email === 'test@mail.com')).toBeTruthy();
      expect(res.body.some(borrow => borrow.borrower.email === 'test2@mail.com')).toBeTruthy();
    });

    it('should return 401 if the user is not logged in', async () => {
      const token = '';

      const res = await request(server)
        .get('/api/borrows')
        .set('x-auth', token);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id', () => {
    let id;
    let borrow;
    let token;

    const run = () => {
      return request(server)
        .get(`/api/borrows/${id}`)
        .set('x-auth', token);
    };

    beforeEach(async () => {
      borrow = new Borrow({
        borrower: {
          firstName: 'first',
          lastName: 'last',
          email: 'test@mail.com',
          phone: '123-12-12'
        },
        book: {
          title: 'title 1',
          failedReturnFee: 50
        }
      });
      borrow.setDueDate();
      
      await borrow.save();

      id = borrow._id;
      token = new User().generateAuthToken();
    });

    it('should return the borrow if the given id is valid', async () => {
      const res = await run();

      const resBodyProps = Object.keys(res.body);
      const expectedArrayProps = [
        '_id',
        'borrower',
        'book',
        'dateBorrowed',
        'dueDate'
      ];

      expect(res.status).toBe(200);
      expect(resBodyProps).toEqual(expect.arrayContaining(expectedArrayProps));
      expect(res.body).toHaveProperty('_id', id.toHexString());
      expect(res.body).toHaveProperty('borrower.email', borrow.borrower.email);
      expect(res.body).toHaveProperty('book.title', borrow.book.title);
      expect(res.body).toHaveProperty('book.failedReturnFee', borrow.book.failedReturnFee);
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 404 if the given id is not valid', async () => {
      id = '1';

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if borrow not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let borrowerId;
    let bookId;
    let token;
    let borrower;
    let book;

    const run = () => {
      return request(server)
        .post('/api/borrows')
        .set('x-auth', token)
        .send({ borrowerId, bookId });
    };

    beforeEach(async () => {
      borrowerId = mongoose.Types.ObjectId();
      bookId = mongoose.Types.ObjectId();

      borrower = new Borrower({
        _id: borrowerId,
        firstName: 'first',
        lastName: 'last',
        age: 20,
        gender: 'Male',
        email: 'test@mail.com',
        address: '123 test street',
        phone: '123-12-12'
      });
      book = new Book({
        _id: bookId,
        title: 'title 1',
        category: { name: 'category 1' },
        stock: 10,
        failedReturnFee: 50
      });

      await Promise.all([borrower.save(), book.save()]);

      token = new User().generateAuthToken();
    });

    afterEach(async () => {
      await Promise.all([Borrower.remove({}), Book.remove({})]);
    });

    it('should save the borrow if it is valid', async () => {
      await run();

      const borrow = await Borrow.find({
        'borrower._id': borrowerId,
        'book._id': bookId
      });

      expect(borrow).not.toBeNull();
    });

    it('should set the dateBorrowed if it is valid', async () => {
      await run();

      const borrow = await Borrow.findOne({
        'borrower._id': borrowerId,
        'book._id': bookId
      });
      const diff = new Date() - borrow.dateBorrowed;

      expect(diff).toBeLessThan(10 * 1000);
    });

    it('should set the dueDate to dateBorrowed plus 2 days', async () => {
      await run();

      const borrow = await Borrow.findOne({
        'borrower._id': borrowerId,
        'book._id': bookId
      });
      const desireDueDate = moment(borrow.dateBorrowed).add(2, 'days').toDate();
      const difference = desireDueDate - borrow.dueDate;
      
      const days = moment(borrow.dueDate).diff(moment(borrow.dateBorrowed), 'days');

      expect(difference).toBeLessThan(10 * 1000);
      expect(days).toBe(2);
    });

    it('should decrement the book stock if borrow is valid', async () => {
      await run();

      const bookInDB = await Book.findById(bookId);

      expect(bookInDB.stock).toBe(book.stock - 1);
    });

    it('should return the borrow if it is valid', async () => {
      const res = await run();

      const resBodyProps = Object.keys(res.body);
      const expectedArrayProps = [
        '_id',
        'borrower',
        'book',
        'dateBorrowed',
        'dueDate'
      ];
      
      expect(resBodyProps).toEqual(expect.arrayContaining(expectedArrayProps));
      expect(res.body).toHaveProperty('borrower._id', borrowerId.toHexString());
      expect(res.body).toHaveProperty('book._id', bookId.toHexString()); 
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 400 if the borrowerId is not given', async () => {
      borrowerId = '';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the bookId is not given', async () => {
      bookId = '';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the book not in stock', async () => {
      book.stock = 0;
      await book.save();

      const res = await run();

      expect(res.status).toBe(400);
    });
  });
});
