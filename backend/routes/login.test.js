const response = require('supertest');

const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');

describe('/login', () => {
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

  describe('before user is created in the system', () => {
    describe('POST /', () => {
      it('should return 401 Unauthorized response', async () => {
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('POST /createUser', () => {
      it('should return 401 Unauthorized response', async () => {
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('POST /updatePassword', () => {
      it('should return 401 Unauthorized response', async () => {
        expect(res.statusCode).toEqual(401);
      });
    });
  });
  describe('creating a new user', () => {
    describe('POST /createUser', () => {
      it('should return 403 Forbidden if user does not have an admin role', async () => {
        // code here
        expect(res.statusCode).toEqual(403);
      });
      it('should return 400 Bad response without a valid email', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 200 OK response with a valid email', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 400 Bad response if password is invalid', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 200 OK response if password is valid', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 400 Bad response without one or more roles assigned', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 200 OK response with one or more roles assigned', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 400 Bad response if name is invalid', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 200 OK response if name is valid', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 400 Bad response if phone is invalid', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 200 OK response if phone is valid', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 400 Bad response if an admin role and vendorGroupId is not zero', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad response if an admin role and verifierGroupId is not zero', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad response if not a vendor role and vendorGroupId is valid', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 BAD response if a vendor role is selected and vendorGroupId is invalid', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 200 OK response if a vendor role is selected and vendorGroupId is valid', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 400 Bad response if not a verifier role and verifierGroupId is valid', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 BAD response if a verifier role is selected and verifierGroupId is invalid', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 200 OK response if a verifier role is selected and verifierGroupId is valid', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return a 409 Conflict response if email already exist', async () => {
        // code here
        expect(res.statusCode).toEqual(409);
      });
      it('should not store a raw password', async () => {
        // code here
        // create a new user with admin role and receive a userId
        // find the user with the userId
        // check to make sure password is encrypted
      });
    });
  });
  describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
    beforeEach(async () => {
      await request(server).post('/login/createUser').send(adminUser);
      await request(server).post('/login/createUser').send(vendorUser);
      await request(server).post('/login/createUser').send(verifierUser);
    });
    describe('POST /', () => {
      it('should return 400 BAD response when email or password is missing', async () => {
        // code here test email
        expect(res.statusCode).toEqual(400);
        // code here test pw
        expect(res.statusCode).toEqual(400);
      });
      it('should return 401 Unauthorized response when email not found in system', async () => {
        // code here
        expect(res.statusCode).toEqual(401);
      });
      it('should return 401 Unauthorized response when password does not match', async () => {
        // code here
        expect(res.statusCode).toEqual(401);
      });
      it('should return 200 OK response and a new token when login is valid', async () => {
        // code here
        expect(res.statusCode).toEqual(401);
      });
      it('should return a JWT token with only the user email, _id, roles, and time token was created', async () => {
        // code here
      });
    });
  });
  describe('after admin, vendor, and verifier users are logged in', () => {
    let adminToken;
    let vendorToken;
    let verifierToken;
    beforeEach(async () => {
      await request(server).post('/login/createUser').send(adminUser);
      const response01 = await request(server).post('/login').send(adminUser);
      adminToken = response01.body.token;
      await request(server).post('/login/createUser').send(vendorUser);
      const response02 = await request(server).post('/login').send(vendorUser);
      vendorToken = response02.body.token;
      await request(server).post('/login/createUser').send(verifierUser);
      const response03 = await request(server)
        .post('/login')
        .send(verifierUser);
      verifierToken = response03.body.token;
    });
    describe('POST /updatePassword', () => {
      it('should return 401 Unauthorized response with an invalid token', async () => {
        // code here
        expect(res.statusCode).toEqual(401);
      });
      it('should return 400 BAD response with an invalid password', async () => {
        // code here
        expect(res.statusCode).toEqual(400);
      });
      it('should return 200 OK response when a valid user updates own password', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
      it('should return 200 OK response when an admin updates a user password', async () => {
        // code here
        expect(res.statusCode).toEqual(200);
      });
    });
  });
});
