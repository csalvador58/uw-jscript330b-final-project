const response = require('supertest');

const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');

describe('/vendor', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const adminUser = {
    email: 'testAdminEmail@email.com',
    password: 'admin123',
    roles: 'admin',
    name: 'admin account',
    phone: '2061234567',
    vendorGroupdId: '0',
    verifierGroupdId: '0',
  };
  const vendorUser = {
    email: 'testVendorEmail@email.com',
    password: 'vendor123',
    roles: 'vendor',
    name: 'vendor account',
    phone: '2061112222',
    vendorGroupdId: '111111111',
    verifierGroupdId: '0',
  };
  const verifierUser = {
    email: 'testVerifierEmail@email.com',
    password: 'verifier123',
    roles: 'verifier',
    name: 'verifier account',
    phone: '2063334444',
    vendorGroupdId: '0',
    verifierGroupdId: '333333333',
  };

  describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
    beforeEach(async () => {
      await request(server).post('/login/createUser').send(adminUser);
      await request(server).post('/login/createUser').send(vendorUser);
      await request(server).post('/login/createUser').send(verifierUser);
    });
    describe('Before login', () => {
      describe('GET /', () => {
        it('should return 401 Unauthorized response without a valid token', async () => {
          // code here
          expect(res.statusCode).toEqual(401);
        });
      });
      describe('POST /', () => {
        it('should return 401 Unauthorized response without a valid token', async () => {
          // code here
          expect(res.statusCode).toEqual(401);
        });
      });
      describe('PUT /', () => {
        it('should return 401 Unauthorized response without a valid token', async () => {
          // code here
          expect(res.statusCode).toEqual(401);
        });
      });
      describe('DELETE /', () => {
        it('should return 401 Unauthorized response without a valid token', async () => {
          // code here
          expect(res.statusCode).toEqual(401);
        });
      });
    });
    describe('After login', () => {
      describe('GET /', async () => {
        it('should return 403 Forbidden if user does not have a vendor role', async () => {
          // code here
          expect(res.statusCode).toEqual(403);
        });
        it('should return the vendor user info and all personal records', async () => {
          // code here
          expect(res.statusCode).toEqual(200);
        });
      });
      describe('a vendor user retrieving a personal record - GET /:id', () => {
        it('should return 403 Forbidden if user does not have a vendor role', async () => {
          // code here
          expect(res.statusCode).toEqual(403);
        });
        it('should return 400 Bad Request with an invalid id', async () => {
          // code here
          expect(res.statusCode).toEqual(400);
        });
        it('should return the matching personal record by id', async () => {
          // code here
          expect(res.statusCode).toEqual(200);
        });
      });
      describe('PUT /', () => {
        it('should return 403 Forbidden without an vendor role', async () => {
          // code here
          expect(res.statusCode).toEqual(403);
        });
        it('should return 400 Bad Request if required fields are invalid', async () => {
          // code here
          expect(res.statusCode).toEqual(400);
        });
        it('should return 200 OK with valid data', async () => {
          // code here
          expect(res.statusCode).toEqual(200);
        });
        it('should return a 409 Conflict if email already exist', async () => {
          // code here
          expect(res.statusCode).toEqual(409);
        });
        it('should not store a raw password', async () => {
          // code here
          // find the user with the userId
          // check to make sure password is encrypted
        });
      });
      describe('uploading a new personal record - POST /vendor/data', () => {
        it('should return 403 Forbidden if user does not have a vendor role', async () => {
          // code here
          expect(res.statusCode).toEqual(403);
        });
        it('should return 400 Bad Request if required fields are invalid', async () => {
          // code here
          expect(res.statusCode).toEqual(400);
        });
        it('should return 200 OK with valid data', async () => {
          // code here
          expect(res.statusCode).toEqual(200);
        });
        it('should return a 409 Conflict if a personalData value already exist', async () => {
          // code here
          expect(res.statusCode).toEqual(409);
        });
      });
      describe('DELETE /vendor/:id', () => {
        it('should return 403 Forbidden without an vendor role', async () => {
          // code here
          expect(res.statusCode).toEqual(403);
        });
        it('should return 400 Bad Request if personal record id is not in system', async () => {
          expect(res.statusCode).toEqual(400);
        });
        it('should remove a personal record by id', async () => {
          // code here
          // check user collection
          // check userData collection
        });
      });
    });
  });
});
