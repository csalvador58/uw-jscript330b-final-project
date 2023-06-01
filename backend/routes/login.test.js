const request = require('supertest');
const server = require('../server');
const testUtils = require('../test-utils');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
// secret will not be visible in code
const secret = 'secretKey';

describe('/login', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const adminUser = {
    email: 'AdminEmail@email.com',
    password: 'admin123',
    roles: 'admin',
    name: 'admin account',
    phone: '4251235555',
    groupId: '1',
  };
  const vendorUser = {
    email: 'testVendorEmail@email.com',
    password: 'vendor123',
    roles: 'vendor',
    name: 'vendor account',
    phone: '2061112222',
    groupId: '2',
  };
  const verifierUser = {
    email: 'testVerifierEmail@email.com',
    password: 'verifier123',
    roles: 'verifier',
    name: 'verifier account',
    phone: '2063334444',
    groupId: '3',
  };

  describe('before user is created in the system', () => {
    describe('POST /', () => {
      it('should return 401 Unauthorized response', async () => {
        const res = await request(server).post('/login').send(adminUser);
        expect(res.statusCode).toEqual(401);
      });
    });
    // describe('POST /updatePassword', () => {
    //   it('should return 401 Unauthorized response', async () => {
    //     const res = await request(server)
    //       .post('/login/updatePassword')
    //       .send(adminUser);
    //     expect(res.statusCode).toEqual(401);
    //   });
    // });
  });
  describe.each([adminUser, vendorUser, verifierUser])('User %#', (account) => {
    beforeEach(async () => {
      //   await request(server).post('/admin/createUser').send(adminUser);
      //   await request(server).post('/admin/createUser').send(vendorUser);
      //   await request(server).post('/admin/createUser').send(verifierUser);

      
      const storedUser = (await User.insertMany([adminUser, vendorUser, verifierUser])).map(
        (i) => i.toJSON()
      );
    });
    describe('POST /', () => {
      it.each(['email', 'password'])(
        'should return 400 BAD response when email or password is missing',
        async (key) => {
          const testUser = {
            ...account,
            [key]: '',
          };
          const res = await request(server).post('/login').send(testUser);
          expect(res.statusCode).toEqual(400);
        }
      );
      it('should return 401 Unauthorized response when email not found in system', async () => {
        const res = await request(server).post('/login').send({
          email: 'testBadEmail@email.com',
          password: '123456',
        });
        expect(res.statusCode).toEqual(401);
      });
      it('should return 401 Unauthorized response when password does not match', async () => {
        const res = await request(server)
          .post('/login')
          .send({
            ...account,
            password: 'incorrectPassword',
          });
        expect(res.statusCode).toEqual(401);
      });
      it('should return 200 OK response and a new token when login is valid', async () => {
        const res = await request(server).post('/login').send(account);
        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
      });
      //   it('should return a JWT token with only the user email, _id, roles, and time token was created', async () => {
      //     const vendor = await User.findOne({ email: vendorUser.email }).lean();
      //     console.log('vendor');
      //     console.log(vendor);
      //     const res = await request(server)
      //       .post('/login')
      //       .send({ email: 'testVendorEmail@email.com', password: 'vendor123' });
      //     const token = res.body.token;
      //     const decodedToken = jwt.decode(token);
      //     expect(decodedToken.email).toEqual(vendor.email);
      //     expect(decodedToken._id).toEqual(vendor._id);
      //     expect(decodedToken.roles).toEqual(['admin']);
      //     expect(decodedToken.password).toBeUndefined();
      //   });
    });
  });
  //   describe('after admin, vendor, and verifier users are logged in', () => {
  //     let adminToken;
  //     let vendorToken;
  //     let verifierToken;
  //     beforeEach(async () => {
  //       await request(server).post('/admin/createUser').send(adminUser);
  //       const response01 = await request(server).post('/login').send(adminUser);
  //       adminToken = response01.body.token;
  //       await request(server).post('/admin/createUser').send(vendorUser);
  //       const response02 = await request(server).post('/login').send(vendorUser);
  //       vendorToken = response02.body.token;
  //       await request(server).post('/admin/createUser').send(verifierUser);
  //       const response03 = await request(server)
  //         .post('/login')
  //         .send(verifierUser);
  //       verifierToken = response03.body.token;
  //     });
  //     describe('POST /updatePassword', () => {
  //       it('should return 401 Unauthorized response with an invalid token', async () => {
  //         // code here
  //         expect(res.statusCode).toEqual(401);
  //       });
  //       it('should return 400 BAD response with an invalid password', async () => {
  //         // code here
  //         expect(res.statusCode).toEqual(400);
  //       });
  //       it('should return 200 OK response when a valid user updates own password', async () => {
  //         // code here
  //         expect(res.statusCode).toEqual(200);
  //       });
  //       it('should return 200 OK response when an admin updates a user password', async () => {
  //         // code here
  //         expect(res.statusCode).toEqual(200);
  //       });
  //     });
  //   });
});
