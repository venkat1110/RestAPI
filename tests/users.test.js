const request = require('supertest');
const mongoose = require('mongoose');

const { connectTestDB, startConnection, closeConnection } = require('./helper/test_helper');
const { User } = require('../models/User');

let server;

describe('/api/users', () => {
  beforeAll(() => {
    connectTestDB();
    server = startConnection();
  });

  afterAll(async () => {
    await closeConnection(server);
  });

  afterEach(async () => {
    await User.remove({});
  });

  describe('POST /', () => {
    let username;
    let email;
    let password;
    let existingUser;

    const run = () => {
      return request(server)
        .post('/api/users')
        .send({ username, email, password });
    };

    beforeEach(async () => {
      existingUser = new User({
        username: 'existing user',
        email: 'test@existing.com',
        password: '123456'
      });
      await existingUser.save();

      username = 'test user';
      email = 'test@newmail.com';
      password = 'password';
    });

    it('should save the user if it is valid', async () => {
      await run();

      const user = await User.findOne({ email });

      expect(user).not.toBeNull();
    });

    it('should save the hashed password instead of plain password', async () => {
      await run();

      const user = await User.findOne({ email });

      expect(user.password).not.toBe(password);
    });

    it('should return the user if it is valid', async () => {
      const res = await run();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username', username);
      expect(res.body).toHaveProperty('email', email);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 400 if username is invalid', async () => {
      username = '';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the email is invalid', async () => {
      email = 'invalidEmail';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if email is already exists', async () => {
      email = existingUser.email;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the password is invalid', async () => {
      password = '12345';

      const res = await run();

      expect(res.status).toBe(400);
    });
  });

  describe('GET /me', () => {
    let token;
    let user;

    const run = () => {
      return request(server)
        .get('/api/users/me')
        .set('x-auth', token);
    };

    beforeEach(async () => {
      user = new User({
        username: 'my username',
        email: 'test@mail.com',
        password: '123456'
      });
      await user.save();

      token = user.generateAuthToken();
    });

    it('should return user if authenticated', async () => {
      const res = await run();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username', user.username);
      expect(res.body).toHaveProperty('email', user.email);
    });

    it('should return 401 if no token provided', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 400 if token is already expired', async () => {
      const tokenHead = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const tokenPayload = 'eyJfaWQiOiI1YjMzNmJjNTBmYmI2NDBiYmNlZTI0ODIiLCJpYXQiOjE1MzA0MDk5NDMsImV4cCI6MTUzMDQwOTk0NH0';
      const tokenSign = '4UZ-zjtkpet1GbHDtCDPaUnRK0Vg8cx96RvmcQczcjc';
      const expiredToken = `${tokenHead}.${tokenPayload}.${tokenSign}`;

      token = expiredToken;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if token is invalid', async () => {
      token = 'invalid';

      const res = await run();

      expect(res.status).toBe(400);
    });
  });
});
