const request = require('supertest');
const server = require('../server');
const mongoose = require('mongoose');
const testUtils = require('../test-utils');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const user = require('../models/user');
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
    phone: 4251235555,
    groupId: 1,
  };
  const vendorUser = {
    email: 'VendorEmail@email.com',
    password: 'vendor123!',
    roles: ['vendor'],
    name: 'vendor account',
    phone: 2061112222,
    groupId: 2,
  };
  const vendorUser2 = {
    email: 'VendorEmail2@email.com',
    password: 'vendor1232!',
    roles: ['vendor'],
    name: 'vendor account2',
    phone: 2065556666,
    groupId: 2,
  };
  const verifierUser = {
    email: 'VerifierEmail@email.com',
    password: 'verifier123!',
    roles: ['verifier'],
    name: 'verifier account',
    phone: 2063334444,
    groupId: 3,
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

    //   describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
    describe('GET /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server).post('/login').send(adminUser);
        const token = res.body.token;
        res = await request(server)
          .get('/admin')
          .set('Authorization', 'Bearer BAD');
        expect(res.statusCode).toEqual(401);
      });
      //   describe('POST /', () => {
      //     it('should return 401 Unauthorized response without a valid token', async () => {
      //       let res = await request(server).post('/login').send(adminUser);
      //       const token = res.body.token;
      //       res = await request(server)
      //         .get('/admin')
      //         .set('Authorization', 'Bearer BAD');
      //       expect(res.statusCode).toEqual(401);
      //     });
      //   });
      //   describe('PUT /', () => {
      //     it('should return 401 Unauthorized response without a valid token', async () => {
      //       let res = await request(server).post('/login').send(adminUser);
      //       const token = res.body.token;
      //       res = await request(server)
      //         .get('/admin')
      //         .set('Authorization', 'Bearer BAD');
      //       expect(res.statusCode).toEqual(401);
      //     });
      //   });
      //   describe('DELETE /', () => {
      //     it('should return 401 Unauthorized response without a valid token', async () => {
      //       let res = await request(server).post('/login').send(adminUser);
      //       const token = res.body.token;
      //       res = await request(server)
      //         .get('/admin')
      //         .set('Authorization', 'Bearer BAD');
      //       expect(res.statusCode).toEqual(401);
      //     });
      //   });
    });
  });

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
        let res = await request(server).post('/login').send(adminUser);
        token = res.body.token;
      });
      it.each([vendorUser, verifierUser])(
        'should return 403 Forbidden without an admin role',
        async (account) => {
          res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;
          const { _id: nonAdminUserId } = await User.findOne({
            email: account.email,
          }).lean();
          res = await request(server)
            .get(`/admin/`)
            .set('Authorization', 'Bearer ' + accountToken);
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 200 OK and user account', async () => {
        let user = await User.findOne({
          email: adminUser.email,
        }).lean();
        user = {
          ...user,
          _id: user._id.toString(),
        };
        res = await request(server)
          .get(`/admin`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(user);
      });
    });
    describe('GET /:id', () => {
      let token;
      beforeEach(async () => {
        let res = await request(server).post('/login').send(adminUser);
        token = res.body.token;
      });
      it.each([vendorUser, verifierUser])(
        'should return 403 Forbidden without an admin role',
        async (account) => {
          console.log('iterate accounts: ');
          console.log(account);
          res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;
          const { _id: nonAdminUserId } = await User.findOne({
            email: account.email,
          }).lean();
          res = await request(server)
            .get(`/admin/${nonAdminUserId.toString()}`)
            .set('Authorization', 'Bearer ' + accountToken);
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 400 Bad Request with an invalid userId format', async () => {
        let testId = '6000111222333444555666777888';
        res = await request(server)
          .get(`/admin/${testId}`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad Request when no users are associated with a userId', async () => {
        let testId = '6478141ee3d10726f1b2a0dc';
        res = await request(server)
          .get(`/admin/${testId}`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(400);
      });
      it.each([adminUser, vendorUser, verifierUser])(
        'should return 200 OK and the matching account for a user with an admin role',
        async (account) => {
          let user = await User.findOne({
            email: account.email,
          }).lean();
          user = {
            ...user,
            _id: user._id.toString(),
          };
          res = await request(server)
            .get(`/admin/${user._id}`)
            .set('Authorization', 'Bearer ' + token);
          expect(res.statusCode).toEqual(200);
          expect(res.body).toMatchObject(user);
        }
      );
    });
    describe('GET /admin/search?groupId=', () => {
      let token;
      beforeEach(async () => {
        let res = await request(server).post('/login').send(adminUser);
        token = res.body.token;
      });
      it.each([vendorUser, verifierUser])(
        'should return 403 Forbidden without an admin role',
        async (account) => {
          res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;
          res = await request(server)
            .get(`/admin/search?groupId=1`)
            .set('Authorization', 'Bearer ' + accountToken);
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 400 Bad Request when no users are associated with a groupId', async () => {
        let unusedGroupId = 99;
        res = await request(server)
          .get(`/admin/search?groupId=${unusedGroupId}`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(400);
      });
      it('should return all users with matching groupId', async () => {
        let validGroupId = vendorUser.groupId;
        let users = await User.find({
          groupId: validGroupId,
        }).lean();
        const usersByGroupId = users.map((user) => {
          return {
            ...user,
            _id: user._id.toString(),
          };
        });
        res = await request(server)
          .get(`/admin/search?groupId=${validGroupId}`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(usersByGroupId);
      });
    });

    describe('POST /createUser', () => {
      let token;
      beforeEach(async () => {
        let res = await request(server).post('/login').send(adminUser);
        token = res.body.token;
      });
      it('should return 401 without a valid token', async () => {
        res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer BAD')
          .send(vendorUser);
        expect(res.statusCode).toEqual(401);
      });
      describe.skip('creating a new user - POST /admin/createUser', () => {
        it('should return 403 Forbidden if user does not have an admin role', async () => {
          // code here
          expect(res.statusCode).toEqual(403);
        });
        // it('should return 400 Bad Request without a valid email', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 200 OK with a valid email', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return 400 Bad Request if password is invalid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 200 OK if password is valid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return 400 Bad Request without one or more roles assigned', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 200 OK with one or more roles assigned', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return 400 Bad Request if name is invalid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 200 OK if name is valid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return 400 Bad Request if phone is invalid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 200 OK if phone is valid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return 400 Bad Request if an admin role and vendorGroupId is not zero', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 400 Bad Request if an admin role and verifierGroupId is not zero', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 400 Bad Request if not a vendor role and vendorGroupId is valid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 400 Bad Request if a vendor role is selected and vendorGroupId is invalid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return 200 OK if a vendor role is selected and vendorGroupId is valid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return 400 Bad Request if not a verifier role and verifierGroupId is valid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(400);
        // });
        // it('should return 400 Bad Request if a verifier role is selected and verifierGroupId is invalid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return 200 OK if a verifier role is selected and verifierGroupId is valid', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(200);
        // });
        // it('should return a 409 Conflict if email already exist', async () => {
        //   // code here
        //   expect(res.statusCode).toEqual(409);
        // });
        // it('should not store a raw password', async () => {
        //   // code here
        //   // create a new user with admin role and receive a userId
        //   // find the user with the userId
        //   // check to make sure password is encrypted
        // });
      });
    });

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
