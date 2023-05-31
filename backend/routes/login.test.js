const request = require('supertest');

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
        const res = await request(server).post('/login').send(adminUser);
        expect(res.statusCode).toEqual(401);
      });
    });
    // describe('POST /createUser', () => {
    //   it('should return 401 Unauthorized response', async () => {
    //     const res = await request(server)
    //       .post('/login/createUser')
    //       .send(adminUser);
    //     expect(res.statusCode).toEqual(401);
    //   });
    // });
    // describe('POST /updatePassword', () => {
    //   it('should return 401 Unauthorized response', async () => {
    //     const res = await request(server)
    //       .post('/login/updatePassword')
    //       .send(adminUser);
    //     expect(res.statusCode).toEqual(401);
    //   });
    // });
  });
  describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
    beforeEach(async () => {
      await request(server).post('/admin/createUser').send(adminUser);
      await request(server).post('/admin/createUser').send(vendorUser);
      await request(server).post('/admin/createUser').send(verifierUser);
    });
    describe('POST /', () => {
      it.each(['email', 'password'])(
        'should return 400 BAD response when email or password is missing',
        async (key) => {
          const testUser = {
            ...user,
            [key]: '',
          };
          const res = await request(server).post('/login').send(testUser);
          expect(res.statusCode).toEqual(400);
        }
      );
      it('should return 401 Unauthorized response when email not found in system', async () => {
        const res = await request(server).post('/login').send({
            email: 'testBadEmail@email.com',
            password: '123456'
        });
        expect(res.statusCode).toEqual(401);
      });
      it('should return 401 Unauthorized response when password does not match', async () => {
        const res = await request(server).post('/login').send({
            ...adminUser,
            password: 'incorrectPassword'
        });
        expect(res.statusCode).toEqual(401);
      });
    //   it('should return 200 OK response and a new token when login is valid', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(200);
    //   });
    //   it('should return a JWT token with only the user email, _id, roles, and time token was created', async () => {
    //     // code here
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
