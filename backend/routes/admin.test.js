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

describe('/admin', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const adminToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDc4MTE3MGYzMjA0Y2ZiNjRmZGU1N2UiLCJlbWFpbCI6InRlc3RBZG1pbkVtYWlsQGVtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY4NTc3MTU3OX0.zFtE87MKmXXtqYUbOROeuM0Aw_bUx-RMba_mTfTbDh4';
  const adminUser = {
    email: 'AdminEmail@email.com',
    password: 'admin123!',
    roles: ['admin'],
    name: 'admin account',
    phone: '4251235555',
    groupId: '1',
  };
  const vendorUser = {
    email: 'VendorEmail@email.com',
    password: 'vendor123!',
    roles: ['vendor'],
    name: 'vendor account',
    phone: '2061112222',
    groupId: '2',
  };
  const verifierUser = {
    email: 'VerifierEmail@email.com',
    password: 'verifier123!',
    roles: ['verifier'],
    name: 'verifier account',
    phone: '2063334444',
    groupId: '3',
  };

  //   describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
  //   describe('Before login', () => {
  //     beforeEach(async () => {
  //       await request(server)
  //         .post('/admin/createUser')
  //         .set('Authorization', 'Bearer ' + adminToken)
  //         .send(adminUser);
  //       await request(server)
  //         .post('/admin/createUser')
  //         .set('Authorization', 'Bearer ' + adminToken)
  //         .send(vendorUser);
  //       await request(server)
  //         .post('/admin/createUser')
  //         .set('Authorization', 'Bearer ' + adminToken)
  //         .send(verifierUser);
  //     });

  //     describe('GET /', () => {
  //       it('should return 401 Unauthorized response without a valid token', async () => {
  //         const res = await request(server).get('/admin');
  //         expect(res.statusCode).toEqual(401);
  //       });
  //     });
  //     describe('POST /', () => {
  //       it('should return 401 Unauthorized response without a valid token', async () => {
  //         // code here
  //         expect(res.statusCode).toEqual(401);
  //       });
  //     });
  //     describe('PUT /', () => {
  //       it('should return 401 Unauthorized response without a valid token', async () => {
  //         // code here
  //         expect(res.statusCode).toEqual(401);
  //       });
  //     });
  //     describe('DELETE /', () => {
  //       it('should return 401 Unauthorized response without a valid token', async () => {
  //         // code here
  //         expect(res.statusCode).toEqual(401);
  //       });
  //     });
  //   });

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
        .send(verifierUser);
    });
    describe('GET /:id', () => {
      it('should return 403 Forbidden without an admin role', async () => {
        let res = await request(server).post('/login').send(vendorUser);
        const token = res.body.token;
        const { _id: nonAdminUserId } = await User.findOne({
          email: vendorUser.email,
        }).lean();
        res = await request(server)
          .get(`/admin/${nonAdminUserId.toString()}`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(403);
      });
      it('should return 200 OK with admin user info', async () => {
        let res = await request(server).post('/login').send(adminUser);
        const token = res.body.token;
        const user = await User.findOne({
          email: adminUser.email,
        }).lean();
        const userJSON = JSON.stringify(user);
        res = await request(server)
          .get(`/admin/${user._id.toString()}`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        console.log('res.body');
        console.log(res.body);
        console.log('user');
        console.log(user);
        console.log(userJSON);
        console.log(JSON.parse(userJSON));
        expect(res.body).toMatchObject(JSON.parse(userJSON));
      });

      //   it('should return 400 Bad Request with an invalid userId', async () => {
      //     // code here
      //     expect(res.statusCode).toEqual(400);
      //   });
      //   it('should return the matching user by userId for a user with an admin role', async () => {
      //     // code here
      //     expect(res.statusCode).toEqual(200);
      //   });
      //   it('should return 204 No Content when no users are associated with a userId', async () => {
      //     // code here
      //     expect(res.statusCode).toEqual(204);
      //   });
    });
    // describe('GET /admin?vendorId=', async () => {
    //   it('should return 403 Forbidden without an admin role', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(403);
    //   });
    //   it('should return all users with matching vendorId', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(200);
    //   });
    //   it('should return 204 No Content when no users are associated with a vendorId', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(204);
    //   });
    // });
    // describe('GET /admin?verifierId=', async () => {
    //   it('should return 403 Forbidden without an admin role', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(403);
    //   });
    //   it('should return all users with matching verifierId', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(200);
    //   });
    //   it('should return 204 No Content when no users are associated with a verifierId', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(204);
    //   });
    // });
    // describe('GET /search?query=', () => {
    //   it('should return 403 Forbidden without an admin role', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(403);
    //   });
    //   it('should return a limit of 5 users for a search based on name, email, or phone and sorted by best multiple terms', async () => {
    //     // code here
    //   });
    //   it('should return 204 No Content when no users are associated with a verifierId', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(204);
    //   });
    // });

    // describe('POST /', () => {
    //   it('should return 401 without a valid token', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(401);
    //   });
    //   describe('creating a new user - POST /admin/createUser', () => {
    //     it('should return 403 Forbidden if user does not have an admin role', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(403);
    //     });
    //     it('should return 400 Bad Request without a valid email', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 200 OK with a valid email', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return 400 Bad Request if password is invalid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 200 OK if password is valid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return 400 Bad Request without one or more roles assigned', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 200 OK with one or more roles assigned', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return 400 Bad Request if name is invalid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 200 OK if name is valid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return 400 Bad Request if phone is invalid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 200 OK if phone is valid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return 400 Bad Request if an admin role and vendorGroupId is not zero', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 400 Bad Request if an admin role and verifierGroupId is not zero', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 400 Bad Request if not a vendor role and vendorGroupId is valid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 400 Bad Request if a vendor role is selected and vendorGroupId is invalid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return 200 OK if a vendor role is selected and vendorGroupId is valid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return 400 Bad Request if not a verifier role and verifierGroupId is valid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 400 Bad Request if a verifier role is selected and verifierGroupId is invalid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return 200 OK if a verifier role is selected and verifierGroupId is valid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return a 409 Conflict if email already exist', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(409);
    //     });
    //     it('should not store a raw password', async () => {
    //       // code here
    //       // create a new user with admin role and receive a userId
    //       // find the user with the userId
    //       // check to make sure password is encrypted
    //     });
    //   });
    // });

    // describe('PUT /', () => {
    //   it('should return 403 Forbidden without an admin role', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(403);
    //   });
    //   describe('updating admin user info - PUT /', () => {
    //     it('should return 400 Bad Request if required fields are invalid', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(400);
    //     });
    //     it('should return 200 OK with valid data', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(200);
    //     });
    //     it('should return a 409 Conflict if email already exist', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(409);
    //     });
    //     it('should not store a raw password', async () => {
    //       // code here
    //       // create a new user with admin role and receive a userId
    //       // find the user with the userId
    //       // check to make sure password is encrypted
    //     });
    //   });
    //   describe('updating email, phone, or password for a userId - PUT /admin/:id', () => {
    //     it('should return 403 Forbidden without an admin role', async () => {
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
    //     it('should return a 409 Conflict if email already exist', async () => {
    //       // code here
    //       expect(res.statusCode).toEqual(409);
    //     });
    //     it('should not store a raw password', async () => {
    //       // code here
    //       // create a new user with admin role and receive a userId
    //       // find the user with the userId
    //       // check to make sure password is encrypted
    //     });
    //   });
    // });

    // describe('DELETE /admin/:id', () => {
    //   it('should return 403 Forbidden without an admin role', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(403);
    //   });
    //   it('should return 405 Method Not Allowed if admin attempts to delete itself', async () => {
    //     // code here
    //     expect(res.statusCode).toEqual(405);
    //   });
    //   it('should return 400 Bad Request if userId is not in system', async () => {
    //     expect(res.statusCode).toEqual(400);
    //   });
    //   it('should remove user and userData collections by userId', async () => {
    //     // code here
    //     // check user collection
    //     // check userData collection
    //   });
    // });
  });
});
