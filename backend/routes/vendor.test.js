const request = require('supertest');
const server = require('../server');
const mongoose = require('mongoose');
const testUtils = require('../test-utils');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
// secret will not be visible in code
const secret = 'secretKey';

describe.skip('/vendor', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const adminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDc4MTE3MGYzMjA0Y2ZiNjRmZGU1N2UiLCJlbWFpbCI6InRlc3RBZG1pbkVtYWlsQGVtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY4NTg2MTU5OX0.uh_f5_RBRyBBBtZjjtGxGi8E9NT-wWa6bFubA9-o-FE';

  const adminGroupId = 1;
  const vendorGroupId = 2;
  const verifierGroupId = 3;

  const adminUser = {
    email: 'AdminEmail@email.com',
    password: 'admin123!',
    roles: ['admin'],
    name: 'admin account',
    phone: 4251235555,
    groupId: adminGroupId,
  };
  const vendorUser = {
    email: 'VendorEmail@email.com',
    password: 'vendor123!',
    roles: ['vendor'],
    name: 'vendor account',
    phone: 2061112222,
    groupId: vendorGroupId,
  };
  const vendorUser2 = {
    email: 'VendorEmail2@email.com',
    password: 'vendor1232!',
    roles: ['vendor'],
    name: 'vendor account2',
    phone: 2065556666,
    groupId: vendorGroupId,
  };
  const verifierUser = {
    email: 'VerifierEmail@email.com',
    password: 'verifier123!',
    roles: ['verifier'],
    name: 'verifier account',
    phone: 2063334444,
    groupId: verifierGroupId,
  };

  describe('Before login', () => {
    beforeEach(async () => {
      await request(server)
        .post('/admin/createUser')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(adminUser);
      await request(server)
        .post('/admin/createUser')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(vendorUser);
      await request(server)
        .post('/admin/createUser')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(verifierUser);
    });
    // describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
    // describe('GET /', () => {
    //   it('should return 401 Unauthorized response without a valid token', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(401);
    //   });
    // });
    // describe('POST /', () => {
    //   it('should return 401 Unauthorized response without a valid token', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(401);
    //   });
    // });
    // describe('PUT /', () => {
    //   it('should return 401 Unauthorized response without a valid token', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(401);
    //   });
    // });
    // describe('DELETE /', () => {
    //   it('should return 401 Unauthorized response without a valid token', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(401);
    //   });
    // });

    describe('After login', () => {
      beforeEach(async () => {
        await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + adminToken)
          .send(adminUser);
        await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + adminToken)
          .send(vendorUser);
        await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + adminToken)
          .send(vendorUser2);
        await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + adminToken)
          .send(verifierUser);
      });
      describe('GET /', () => {
        let token;
        beforeEach(async () => {
          let res = await request(server).post('/login').send(vendorUser);
          token = res.body.token;
        });
        it.each([adminUser, verifierUser])(
          'should return 403 Forbidden if user does not have a vendor role',
          async (account) => {
            res = await request(server).post('/login').send(account);
            const accountToken = res.body.token;
            res = await request(server)
              .get('/vendor')
              .set('Authorization', 'Bearer ' + accountToken);
            expect(res.statusCode).toEqual(403);
          }
        );
        it('should return 200 OK response and the vendor user info', async () => {
          let user = await User.findOne({ email: vendorUser.email }).lean();
          user._id = user._id.toString();
          res = await request(server)
            .get('/vendor')
            .set('Authorization', 'Bearer ' + token);
          expect(res.statusCode).toEqual(200);
          expect(res.body).toMatchObject(user);
        });
        // it('should return personal data if data option is included in request', async () => {
        //     // .get('/vendor?data=true')
        // })
      });
      //   describe('a vendor user retrieving a personal record - GET /:id', () => {
      //     it('should return 403 Forbidden if user does not have a vendor role', async () => {
      //       // code here
      //       expect(res.statusCode).toEqual(403);
      //     });
      //     it('should return 400 Bad Request with an invalid id', async () => {
      //       // code here
      //       expect(res.statusCode).toEqual(400);
      //     });
      //     it('should return the matching personal record by id', async () => {
      //       // code here
      //       expect(res.statusCode).toEqual(200);
      //     });
      //   });
      describe('PUT /', () => {
        let token;
        beforeEach(async () => {
          let res = await request(server).post('/login').send(vendorUser);
          token = res.body.token;
        });
        it('should return 403 Forbidden without an vendor role', async () => {
          res = await request(server).put('/vendor').set('Authorization', 'Bearer ' + token);
          expect(res.statusCode).toEqual(403);
        });
        //   it('should return 400 Bad Request if required fields are invalid', async () => {
        //     // code here
        //     expect(res.statusCode).toEqual(400);
        //   });
        //   it('should return 200 OK with valid data', async () => {
        //     // code here
        //     expect(res.statusCode).toEqual(200);
        //   });
        //   it('should return a 409 Conflict if email already exist', async () => {
        //     // code here
        //     expect(res.statusCode).toEqual(409);
        //   });
        //   it('should not store a raw password', async () => {
        //     // code here
        //     // find the user with the userId
        //     // check to make sure password is encrypted
        //   });
      });
      //   describe('uploading a new personal record - POST /vendor/data', () => {
      //     it('should return 403 Forbidden if user does not have a vendor role', async () => {
      //       // code here
      //       expect(res.statusCode).toEqual(403);
      //     });
      //     it('should return 400 Bad Request if required fields are invalid', async () => {
      //       // code here
      //       expect(res.statusCode).toEqual(400);
      //     });
      //     it('should return 200 OK with valid data', async () => {
      //       // code here
      //       expect(res.statusCode).toEqual(200);
      //     });
      //     it('should return a 409 Conflict if a personalData value already exist', async () => {
      //       // code here
      //       expect(res.statusCode).toEqual(409);
      //     });
      //   });
      //   describe('DELETE /vendor/:id', () => {
      //     it('should return 403 Forbidden without an vendor role', async () => {
      //       // code here
      //       expect(res.statusCode).toEqual(403);
      //     });
      //     it('should return 400 Bad Request if personal record id is not in system', async () => {
      //       expect(res.statusCode).toEqual(400);
      //     });
      //     it('should remove a personal record by id', async () => {
      //       // code here
      //       // check user collection
      //       // check userData collection
      //     });
      //   });
    });
  });
});
