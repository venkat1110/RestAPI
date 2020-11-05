const request = require('supertest');
const mongoose = require('mongoose');

const { connectTestDB, startConnection, closeConnection } = require('./helper/test_helper');
const { Book } = require('../models/Book');
const { Category } = require('../models/Category');
const { User } = require('../models/User');

let server;

describe('/api/books', () => {
  beforeAll(() => {
    connectTestDB();
    server = startConnection();
  });

  afterAll(async () => {
    await closeConnection(server);
  });

  afterEach(async () => {
    await Book.remove({});
  });

  describe('GET /', () => {
    it('should return all books', async () => {
      const books = [
        {
          title: 'title 1',
          category: { name: 'category 1' },
          stock: 1,
          failedReturnFee: 50
        },
        {
          title: 'title 2',
          category: { name: 'category 2' },
          stock: 1,
          failedReturnFee: 100
        }
      ];

      await Book.insertMany(books);

      const res = await request(server).get('/api/books');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(book => book.title === 'title 1')).toBeTruthy();
      expect(res.body.some(book => book.title === 'title 2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let id;
    let book;

    const run = () => {
      return request(server).get(`/api/books/${id}`);
    };

    beforeEach(async () => {
      book = new Book({
        title: 'title 1',
        category: { name: 'category 1' },
        stock: 10,
        failedReturnFee: 50
      });

      await book.save();

      id = book._id;
    });

    it('should return a book if the given id is valid', async () => {
      const res = await run();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', book.title);
      expect(res.body).toHaveProperty('category.name', book.category.name);
      expect(res.body).toHaveProperty('stock', book.stock);
      expect(res.body).toHaveProperty('failedReturnFee', book.failedReturnFee);
    });

    it('should return 404 if the given id is invalid', async () => {
      id = 1;

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if the book was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let title;
    let categoryId;
    let stock;
    let failedReturnFee;
    let category;
    let token;

    const run = () => {
      return request(server)
        .post('/api/books')
        .set('x-auth', token)
        .send({ title, categoryId, stock, failedReturnFee });
    };

    beforeAll(async () => {
      category = new Category({ name: 'category 1' });
      await category.save();
    });

    afterAll(async () => {
      await Category.remove({});
    });

    beforeEach(() => {
      title = 'title 1';
      categoryId = category._id;
      stock = 10;
      failedReturnFee = 50;
      token = new User().generateAuthToken();
    });

    it('should save the book if it is valid', async () => {
      await run();

      const book = await Book.find({ title: 'title 1' });

      expect(book).not.toBeNull();
    });

    it('should return the book if it is valid', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('title', title);
      expect(res.body).toHaveProperty('category._id', categoryId.toHexString());
      expect(res.body).toHaveProperty('stock', stock);
      expect(res.body).toHaveProperty('failedReturnFee', failedReturnFee);
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 400 if title is invalid', async () => {
      title = '1234';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if categoryId was not found in Category collection', async () => {
      categoryId = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if stock is invalid', async () => {
      stock = -1;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if failedReturnFee is invalid', async () => {
      failedReturnFee = -50;

      const res = await run();

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id', () => {
    let id;
    let newTitle;
    let newCategoryId;
    let newStock;
    let newfailedReturnFee;
    let book;
    let categoryInDB;
    let token;

    const run = () => {
      return request(server)
        .put(`/api/books/${id}`)
        .set('x-auth', token)
        .send({
          title: newTitle,
          categoryId: newCategoryId,
          stock: newStock,
          failedReturnFee: newfailedReturnFee
        });
    };

    beforeAll(async () => {
      categoryInDB = new Category({ name: 'categoryDB' });
      await categoryInDB.save();
    });

    afterAll(async () => {
      await Category.remove({});
    });

    beforeEach(async () => {
      book = new Book({
        title: 'title 1',
        category: { name: 'category 1' },
        stock: 1,
        failedReturnFee: 50
      });
      await book.save();

      id = book._id;
      newTitle = 'updatedTitle';
      newCategoryId = categoryInDB._id;
      newStock = 10;
      newfailedReturnFee = 100;
      token = new User().generateAuthToken();
    });

    it('should update the book if it is valid', async () => {
      await run();

      const updatedBook = await Book.findById(id);

      expect(updatedBook.title).toBe(newTitle);
      expect(updatedBook.category._id).toEqual(categoryInDB._id);
      expect(updatedBook.stock).toBe(newStock);
      expect(updatedBook.failedReturnFee).toBe(newfailedReturnFee);
    });

    it('should return the updated book if it is valid', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('title', newTitle);
      expect(res.body).toHaveProperty('category._id', categoryInDB._id.toHexString());
      expect(res.body).toHaveProperty('stock', newStock);
      expect(res.body).toHaveProperty('failedReturnFee', newfailedReturnFee);
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    }); 

    it('should return 404 if the given id is invalid', async () => {
      id = 1;

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if book not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 400 if new title is invalid', async () => {
      newTitle = '1234';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the new categoryId was not found in Category collection', async () => {
      newCategoryId = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the new stock is invalid', async () => {
      newStock = -1;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the new failedReturnFee is invalid', async () => {
      newfailedReturnFee = -50;

      const res = await run();

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id', () => {
    let id;
    let book;
    let token;

    const run = () => {
      return request(server)
        .delete(`/api/books/${id}`)
        .set('x-auth', token);
    };

    beforeEach(async () => {
      book = new Book({
        title: 'title 1',
        category: { name: 'category 1' },
        stock: 1,
        failedReturnFee: 50
      });
      await book.save();

      id = book._id;
      token = new User().generateAuthToken();
    });

    it('should delete a book', async () => {
      await run();

      const savedBook = await Book.findById(id);

      expect(savedBook).toBeNull();
    });

    it('should return the removed book', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id', book._id.toHexString());
      expect(res.body).toHaveProperty('title', book.title);
      expect(res.body).toHaveProperty('category');
      expect(res.body).toHaveProperty('stock', book.stock);
      expect(res.body).toHaveProperty('failedReturnFee', book.failedReturnFee);
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 404 if the given id is invalid', async () => {
      id = 1;

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if book not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });
  });
});
