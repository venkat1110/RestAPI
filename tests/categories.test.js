const request = require('supertest');
const mongoose = require('mongoose');

const { connectTestDB, startConnection, closeConnection } = require('./helper/test_helper');
const { Category } = require('../models/Category');
const { User } = require('../models/User');

let server;

describe('/api/categories', () => {
  beforeAll(() => {
    connectTestDB();
    server = startConnection();
  });

  afterAll(async () => {
    await closeConnection(server);
  });

  afterEach(async () => {
    await Category.remove({});
  });

  describe('GET /', () => {
    it('should return all categories', async () => {
      const categories = [{ name: 'category 1' }, { name: 'category 2' }];

      await Category.insertMany(categories);

      const res = await request(server).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(cat => cat.name === 'category 1')).toBeTruthy();
      expect(res.body.some(cat => cat.name === 'category 2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let id;
    let category;

    const run = () => {
      return request(server).get(`/api/categories/${id}`);
    };

    beforeEach(async () => {
      category = new Category({ name: 'category 1' });
      await category.save();

      id = category._id;
    });

    it('should return a category if the given id is valid', async () => {
      const res = await run();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', category.name);
    });

    it('should return 404 if the given id is invalid', async () => {
      id = 1;

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if category not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let name;
    let token;

    const run = () => {
      return request(server)
        .post('/api/categories')
        .set('x-auth', token)
        .send({ name });
    };

    beforeEach(() => {
      name = 'category 1';
      token = new User().generateAuthToken();
    });

    it('should save the category if it is valid', async () => {
      await run();

      const category = await Category.find({ name: 'category 1' });

      expect(category).not.toBeNull();
    });

    it('should return the category if it is valid', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'category 1');
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 400 if category name is less than 5 characters', async () => {
      name = '1234';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the category name is greater than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await run();

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id', async () => {
    let id;
    let categoryInDB;
    let newName;
    let token;

    const run = () => {
      return request(server)
        .put(`/api/categories/${id}`)
        .set('x-auth', token)
        .send({ name: newName });
    };

    beforeEach(async () => {
      categoryInDB = new Category({ name: 'category 1' });
      await categoryInDB.save();

      id = categoryInDB._id;
      newName = 'updatedName';
      token = new User().generateAuthToken();
    });

    it('should update the category if it is valid', async () => {
      await run();

      const updatedCategory = await Category.findById(id);

      expect(updatedCategory.name).toBe(newName);
    });

    it('should return the updated category if it is valid', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newName);
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

    it('should return 404 if category not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 400 if category is name less than 5 characters', async () => {
      newName = '1234';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if category is name greater than 50 characters', async () => {
      newName = new Array(52).join('a');

      const res = await run();

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id', () => {
    let id;
    let category;
    let token;

    const run = () => {
      return request(server)
        .delete(`/api/categories/${id}`)
        .set('x-auth', token);
    };

    beforeEach(async () => {
      category = new Category({ name: 'category 1' });
      await category.save();

      id = category._id;
      token = new User().generateAuthToken();
    });

    it('should delete a category', async () => {
      await run();

      const savedCategory = await Category.findById(id);

      expect(savedCategory).toBeNull();
    });

    it('should return the removed category', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id', category._id.toHexString());
      expect(res.body).toHaveProperty('name', category.name);
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

    it('should return 404 if category not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });
  });
});
