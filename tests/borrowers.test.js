const request = require('supertest');
const mongoose = require('mongoose');

const { connectTestDB, startConnection, closeConnection } = require('./helper/test_helper');
const { Borrower } = require('../models/Borrower');
const { User } = require('../models/User');

let server;

describe('/api/borrowers', () => {
  beforeAll(() => {
    connectTestDB();
    server = startConnection();
  });

  afterAll(async () => {
    await closeConnection(server);
  });

  afterEach(async () => {
    await Borrower.remove({});
  });

  describe('GET /', () => {
    it('should return all borrowers', async () => {
      const borrowers = [
        {
          firstName: 'first',
          lastName: 'last',
          age: 20,
          gender: 'Male',
          email: 'borrower1@mail.com',
          address: '123 test street',
          phone: '123-12-12'
        },
        {
          firstName: 'first 2',
          lastName: 'last 2',
          age: 22,
          gender: 'Female',
          email: 'borrower2@mail.com',
          address: '456 test street',
          phone: '456-56-56'
        }
      ];

      await Borrower.insertMany(borrowers);
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get('/api/borrowers')
        .set('x-auth', token);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(borr => borr.email === 'borrower1@mail.com')).toBeTruthy();
      expect(res.body.some(borr => borr.email === 'borrower2@mail.com')).toBeTruthy();
    });

    it('should return 401 if the user is not logged in', async() => {
      const token = '';
      
      const res = await request(server)
        .get('/api/borrowers')
        .set('x-auth', token);
      
        expect(res.status).toBe(401);
    });
  });

  describe('GET /:id', async () => {
    let id;
    let borrower;
    let token;

    const run = () => {
      return request(server)
        .get(`/api/borrowers/${id}`)
        .set('x-auth', token);
    };

    beforeEach(async () => {
      borrower = new Borrower( {
        firstName: 'first',
        lastName: 'last',
        age: 20,
        gender: 'Male',
        email: 'borrower1@mail.com',
        address: '123 test street',
        phone: '123-12-12'
      });
      await borrower.save();

      id = borrower._id;
      token = new User().generateAuthToken();
    });

    it('should return the borrower if the given id is valid', async () => {
      const res = await run();

      expect(res.status).toBe(200);
      expect(Object.keys(res.body))
        .toEqual(expect.arrayContaining([
          '_id', 
          'firstName', 
          'lastName', 
          'age', 
          'gender', 
          'email', 
          'address', 
          'phone'
        ])
      );
      expect(res.body._id).toEqual(borrower._id.toHexString());
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

    it('should return 404 if borrower not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let firstName;
    let lastName;
    let age;
    let gender;
    let email;
    let address;
    let phone;
    let token;

    const run = () => {
      return request(server)
        .post('/api/borrowers')
        .set('x-auth', token)
        .send({ firstName, lastName, age, gender, email, address, phone });
    };

    beforeEach(() => {
      firstName = 'firstname';
      lastName = 'lastname';
      age = 20;
      gender = 'Male';
      email = 'test@mail.com';
      address = '123 test street';
      phone = '123-12-12';
      token = new User().generateAuthToken();
    });

    it('should save the borrower if it is valid', async () => {
      await run();

      const borrower = await Borrower.findOne({ 
        firstName: 'firstname', 
        lastName: 'lastname'
      });

      expect(borrower).not.toBeNull();
    });

    it('should return the borrower if it is valid', async () => {
      const res = await run();

      expect(res.body).toMatchObject({ 
        firstName, 
        lastName, 
        age, 
        gender, 
        email, 
        address,
        phone
      });
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 400 if firstName is invalid', async () => {
      firstName = '12';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if lastName is invalid', async () => {
      lastName = '12';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the age is invalid', async () => {
      age = -1;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the gender is invalid', async () => {
      gender = '';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the email is invalid', async () => {
      email = 'invalid';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the address is invalid', async () => {
      address = '';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the phone is invalid', async () => {
      phone = '';

      const res = await run();

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id', () => {
    let id;
    let newFirstName;
    let newLastName;
    let newAge;
    let newGender;
    let newEmail;
    let newAddress;
    let newPhone;
    let token;
    let borrower;

    const run = () => {
      return request(server)
        .put(`/api/borrowers/${id}`)
        .set('x-auth', token)
        .send({
          firstName: newFirstName,
          lastName: newLastName,
          age: newAge,
          gender: newGender,
          email: newEmail,
          address: newAddress,
          phone: newPhone
        });
    };

    beforeEach(async () => {
      borrower = new Borrower({
        firstName: 'firstname',
        lastName: 'lastname',
        age: 20,
        gender: 'Male',
        email: 'test@mail.com',
        address: '123 test street',
        phone: '123-12-12'
      });
      await borrower.save();

      id = borrower._id;
      newFirstName = 'updatedFirstName';
      newLastName = 'updatedLastName';
      newAge = 30;
      newGender = 'Female';
      newEmail = 'updatedTest@mail.com';
      newAddress = '123 test street update';
      newPhone = '456-56-56';
      token = new User().generateAuthToken();
    });

    it('should update the borrower if it is valid', async () => {
      await run();

      const updateObject = {
        firstName: newFirstName,
        lastName: newLastName,
        age: newAge,
        gender: newGender,
        email: newEmail,
        address: newAddress,
        phone: newPhone
      };
      const updatedBorrower = await Borrower.findById(id);
      
      expect(updatedBorrower).toMatchObject(updateObject);
    });

    it('should return the updated borrower if it is valid', async () => {
      const res = await run();
      const updateObject = {
        firstName: newFirstName,
        lastName: newLastName,
        age: newAge,
        gender: newGender,
        email: newEmail,
        address: newAddress,
        phone: newPhone
      };

      expect(res.body).toMatchObject(updateObject);
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 404 if the given id is invalid', async () => {
      id = '1';

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if the borrower not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 400 if new firstName is invalid', async () => {
      newFirstName = '12';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if new lastName is invalid', async () => {
      newLastName = '12';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the new age is invalid', async () => {
      newAge = -1;

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the new gender is invalid', async () => {
      newGender = '';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the new email is invalid', async () => {
      newEmail = 'invalid';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the new address is invalid', async () => {
      newAddress = '';

      const res = await run();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the new phone is invalid', async () => {
      newPhone = '';

      const res = await run();

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id', () => {
    let id;
    let borrower;
    let token;

    const run = () => {
      return request(server)
        .delete(`/api/borrowers/${id}`)
        .set('x-auth', token);
    };

    beforeEach(async () => {
      borrower = new Borrower( {
        firstName: 'first',
        lastName: 'last',
        age: 20,
        gender: 'Male',
        email: 'borrower@mail.com',
        address: '123 test street',
        phone: '123-12-12'
      });
      await borrower.save();

      id = borrower._id;
      token = new User().generateAuthToken();
    });

    it('should delete a borrower', async () => {
      await run();

      const savedBorrower = await Borrower.findById(id);

      expect(savedBorrower).toBeNull();
    });

    it('should return the removed borrower', async () => {
      const res = await run();
      const { firstName, lastName, age, gender, email, address, phone } = borrower;

      expect(res.body).toMatchObject({ 
        firstName, 
        lastName, 
        age, 
        gender, 
        email, 
        address,
        phone
      });
    });

    it('should return 401 if the user is not logged in', async () => {
      token = '';

      const res = await run();

      expect(res.status).toBe(401);
    });

    it('should return 404 if the given id is invalid', async () => {
      id = '1';

      const res = await run();

      expect(res.status).toBe(404);
    });

    it('should return 404 if the borrower not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await run();

      expect(res.status).toBe(404);
    });
  });
});