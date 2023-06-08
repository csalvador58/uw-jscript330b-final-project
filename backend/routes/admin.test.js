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

  describe('Before login', () => {
    describe('GET /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .get('/admin')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('POST /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('PUT /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .put('/admin')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
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

  describe('After login', () => {
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
        user._id = user._id.toString();
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
          user._id = user._id.toString();
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

    describe('creating a new user - POST /admin/createUser', () => {
      let token;
      const testUser = {
        email: 'TestEmail@email.com',
        password: 'test1232!',
        roles: ['vendor'],
        name: 'test account',
        phone: 2063337777,
        groupId: 2,
      };
      beforeEach(async () => {
        let res = await request(server).post('/login').send(adminUser);
        token = res.body.token;
      });
      it.each([vendorUser, verifierUser])(
        'should return 403 Forbidden if user does not have an admin role',
        async (account) => {
          res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;
          res = await request(server)
            .post('/admin/createUser')
            .set('Authorization', 'Bearer ' + accountToken)
            .send(testUser);
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 400 Bad Request without a valid email', async () => {
        res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send({
            ...testUser,
            email: 'invalidEmail',
          });
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad Request if password is invalid', async () => {
        res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send({
            ...testUser,
            password: 'invalidPassword',
          });
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad Request without one or more roles assigned', async () => {
        res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send({
            ...testUser,
            roles: [],
          });
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad Request if the name is invalid', async () => {
        res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send({
            ...testUser,
            name: '  ',
          });
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad Request if the phone is invalid', async () => {
        res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send({
            ...testUser,
            phone: 123456,
          });
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad Request if the groupId is invalid', async () => {
        res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send({
            ...testUser,
            groupId: 0,
          });
        expect(res.statusCode).toEqual(400);
      });
      it.each([adminUser, vendorUser, verifierUser])(
        'should return 200 OK if all new user inputs are valid',
        async (account) => {
          const newAccount = {
            ...account,
            email: 'newTestEmailAccount@email.com',
          };
          res = await request(server)
            .post('/admin/createUser')
            .set('Authorization', 'Bearer ' + token)
            .send(newAccount);
          expect(res.statusCode).toEqual(200);

          let userObj = await User.findOne({ _id: res.body._id }).lean();
          userObj._id = userObj._id.toString();
          expect(res.body).toMatchObject(userObj);
        }
      );
      it('should return a 409 Conflict if email already exist', async () => {
        const newAccount = {
          ...vendorUser,
          email: 'newTestEmailAccount@email.com',
        };
        await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send(newAccount);

        res = await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send(newAccount);
        expect(res.statusCode).toEqual(409);
      });
      it('should not store a raw password', async () => {
        const newAccount = {
          ...vendorUser,
          email: 'newTestEmailAccount@email.com',
        };
        const originalPassword = newAccount.password;
        await request(server)
          .post('/admin/createUser')
          .set('Authorization', 'Bearer ' + token)
          .send(newAccount);

        const { password: hashedPassword } = await User.findOne({
          email: 'newTestEmailAccount@email.com',
        }).lean();
        expect(hashedPassword).not.toEqual(originalPassword);
      });
    });

    describe('PUT /', () => {
      let token;
      beforeEach(async () => {
        let res = await request(server).post('/login').send(adminUser);
        token = res.body.token;
      });
      it.each([vendorUser, verifierUser])(
        'should return 403 Forbidden without an admin role',
        async (account) => {
          res = await request(server).post('/login').send(account);
          accountToken = res.body.token;
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + accountToken)
            .send();
          expect(res.statusCode).toEqual(403);
        }
      );
      describe('updating admin user info - PUT /', () => {
        it('should return 400 Bad Request without a valid email', async () => {
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              email: 'invalidEmail',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request if password is invalid', async () => {
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              password: 'invalidPassword',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request without one or more roles assigned', async () => {
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              roles: [],
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request if the name is invalid', async () => {
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              name: '  ',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request if the phone is invalid', async () => {
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              phone: 123456,
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request if the groupId is invalid', async () => {
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              groupId: 'invalid',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 200 OK with valid data', async () => {
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              email: 'UpdatedEmail@email.com',
            });
          expect(res.statusCode).toEqual(200);
          let userObj = await User.findOne({
            email: 'UpdatedEmail@email.com',
          }).lean();
          userObj._id = userObj._id.toString();
          expect(res.body).toMatchObject(userObj);
        });
        it('should return a 409 Conflict if email already exist', async () => {
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              email: vendorUser.email,
            });
          expect(res.statusCode).toEqual(409);
        });
        it('should not store a raw password', async () => {
          const { password: oldHashedPassword } = await User.findOne({
            email: adminUser.email,
          }).lean();
          res = await request(server)
            .put('/admin')
            .set('Authorization', 'Bearer ' + token)
            .send({
              password: 'newPassword0!',
            });
          const { password: newHashedPassword } = await User.findOne({
            email: adminUser.email,
          }).lean();
          expect(newHashedPassword).not.toEqual(oldHashedPassword);
          expect(newHashedPassword).not.toEqual('newPassword0!');
        });
      });
    });

    describe('DELETE /admin/:id', () => {
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
            .delete(`/admin/1234`)
            .set('Authorization', 'Bearer ' + accountToken);
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 405 Method Not Allowed if admin attempts to delete itself', async () => {
        let user = await User.findOne({ email: adminUser.email }).lean();
        user._id = user._id.toString();
        res = await request(server)
          .delete(`/admin/${user._id}`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(405);
      });
      it('should return 400 Bad Request if userId is not in system', async () => {
        res = await request(server)
          .delete('/admin/1234')
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(400);
      });
      // it('should remove user and userData collections by userId', async () => {
      //   // code here
      //   // check user collection
      //   // check userData collection
      // });
    });
  });
});
