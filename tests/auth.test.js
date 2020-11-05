const request = require('supertest');
const mongoose = require('mongoose');

const { connectTestDB, startConnection, closeConnection } = require('./helper/test_helper');
const { User } = require('../models/User');

let server;

describe('POST /api/auth', () => {
  let email;
  let password;
  let registeredUser;

  const run = () => {
    return request(server)
      .post('/api/auth')
      .send({ email, password });
  };

  beforeAll(async () => {
    connectTestDB();
    server = startConnection();

    registeredUser = new User({
      username: 'exist user',
      email: 'exist@mail.com',
      password: 'password'
    });
    await registeredUser.save();
  });

  afterAll(async () => {
    await User.remove({});
    await closeConnection(server);
  });

  beforeEach(() => {
    email = 'exist@mail.com';
    password = 'password';
  });

  it('should login the user', async () => {
    const res = await run();

    expect(res.status).toBe(200);
  });

  it('should return the user and auth token', async () => {
    const res = await run();

    expect(res.headers['x-auth']).toBeTruthy();
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('username', registeredUser.username);
    expect(res.body).toHaveProperty('email', registeredUser.email);
  });

  it('should return 400 if email or password is invalid', async () => {
    email = 'invalid';
    password = '';

    const res = await run();

    expect(res.status).toBe(400);
  });

  it('should return 400 if email is not registered', async () => {
    email = 'unknown@mail.com';

    const res = await run();

    expect(res.status).toBe(400);
  });

  it('should return 400 if password is incorrect', async () => {
    password = 'incorrect';

    const res = await run();

    expect(res.status).toBe(400);
  });
});
