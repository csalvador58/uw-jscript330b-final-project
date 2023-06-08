const request = require('supertest');
const server = require('../server');
const mongoose = require('mongoose');
const testUtils = require('../test-utils');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserData = require('../models/userData');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
// secret will not be visible in code
const secret = 'secretKey';

describe('/vendor', () => {
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
  const verifierUser2 = {
    email: 'VerifierEmail2@email.com',
    password: 'verifier1232!',
    roles: ['verifier'],
    name: 'verifier account2',
    phone: 2060001111,
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
    await request(server)
      .post('/admin/createUser')
      .set('Authorization', 'Bearer ' + adminToken)
      .send(verifierUser2);
  });
  // describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
  describe('Before login', () => {
    describe('GET /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .get('/vendor')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('GET /:id', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        const recordId = await UserData.findOne();
        let res = await request(server)
          .get('/vendor/')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('POST /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .post('/vendor/upload')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('PUT /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .put('/vendor')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('DELETE /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .put('/vendor/:1234')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });
  describe('After login', () => {
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
      it('should return the user info and all personal data if data option is included in request', async () => {
        let res01 = await request(server)
          .post('/vendor/upload')
          .set('Authorization', 'Bearer ' + token)
          .send({
            recordType: 'test01',
            dataObject: {
              data01: 'data01',
              data02: 'data02',
              data03: 'data03',
            },
          });
        let res02 = await request(server)
          .post('/vendor/upload')
          .set('Authorization', 'Bearer ' + token)
          .send({
            recordType: 'test02',
            dataObject: {
              data01: 'data01',
              data02: 'data02',
            },
          });
        res = await request(server)
          .get('/vendor?data=true')
          .set('Authorization', 'Bearer ' + token)
          .send();
        expect(res.statusCode).toEqual(200);
      });
    });
    describe('a vendor user retrieving a personal record - GET /:id', () => {
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
            .get('/vendor/:1234')
            .set('Authorization', 'Bearer ' + accountToken);
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 400 Bad Request with an invalid id', async () => {
        res = await request(server)
          .get('/vendor/:1234')
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(400);
      });
      it('should return the matching personal record by id', async () => {
        res = await request(server)
          .post('/vendor/upload')
          .set('Authorization', 'Bearer ' + token)
          .send({
            recordType: 'test01',
            dataObject: {
              data01: 'data01',
              data02: 'data02',
              data03: 'data03',
            },
          });
        let personalRecord = {
          ...res.body,
          _id: res.body._id.toString(),
          userId: res.body.userId.toString(),
        };
        res = await request(server)
          .get(`/vendor/${personalRecord._id}`)
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(personalRecord);
      });
    });
    describe('PUT /', () => {
      let token;
      beforeEach(async () => {
        let res = await request(server).post('/login').send(vendorUser);
        token = res.body.token;
      });
      it.each([adminUser, verifierUser])(
        'should return 403 Forbidden without a vendor role',
        async (account) => {
          res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;
          res = await request(server)
            .put('/vendor')
            .set('Authorization', 'Bearer ' + accountToken)
            .send();
          expect(res.statusCode).toEqual(403);
        }
      );
      describe('updating vendor user info - PUT /', () => {
        it('should return 400 Bad Request without a valid email', async () => {
          res = await request(server)
            .put('/vendor')
            .set('Authorization', 'Bearer ' + token)
            .send({
              email: 'invalidEmail',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request if password is invalid', async () => {
          res = await request(server)
            .put('/vendor')
            .set('Authorization', 'Bearer ' + token)
            .send({
              password: 'invalidPassword',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request if the phone is invalid', async () => {
          res = await request(server)
            .put('/vendor')
            .set('Authorization', 'Bearer ' + token)
            .send({
              phone: 123456,
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 200 OK with valid data', async () => {
          res = await request(server)
            .put('/vendor')
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
            .put('/vendor')
            .set('Authorization', 'Bearer ' + token)
            .send({
              email: vendorUser2.email,
            });
          expect(res.statusCode).toEqual(409);
        });
        it('should not store a raw password', async () => {
          const { password: oldHashedPassword } = await User.findOne({
            email: vendorUser.email,
          }).lean();
          res = await request(server)
            .put('/vendor')
            .set('Authorization', 'Bearer ' + token)
            .send({
              password: 'newPassword0!',
            });
          const { password: newHashedPassword } = await User.findOne({
            email: vendorUser.email,
          }).lean();
          expect(newHashedPassword).not.toEqual(oldHashedPassword);
          expect(newHashedPassword).not.toEqual('newPassword0!');
        });
      });
    });
    describe('uploading a new personal record - POST /vendor/upload', () => {
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
            .post('/vendor/upload')
            .set('Authorization', 'Bearer ' + accountToken);
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 400 Bad Request if required fields are invalid', async () => {
        res = await request(server)
          .post('/vendor/upload')
          .set('Authorization', 'Bearer ' + token)
          .send({
            recordType: 'test01',
            dataObject: {
              data01: 'data01',
              data02: 'data02',
              data03: '',
            },
          });
        expect(res.statusCode).toEqual(400);
      });
      it('should return 200 OK with valid data', async () => {
        res = await request(server)
          .post('/vendor/upload')
          .set('Authorization', 'Bearer ' + token)
          .send({
            recordType: 'test01',
            dataObject: {
              data01: 'data01',
              data02: 'data02',
              data03: 'data03',
            },
          });
        expect(res.statusCode).toEqual(200);
        let dataObj = await UserData.findOne({ _id: res.body._id }).lean();
        dataObj._id = dataObj._id.toString();
        dataObj.userId = dataObj.userId.toString();
        expect(res.body).toMatchObject(dataObj);
      });
      it('should return a 409 Conflict if a recordType already exist', async () => {
        await request(server)
          .post('/vendor/upload')
          .set('Authorization', 'Bearer ' + token)
          .send({
            recordType: 'test01',
            dataObject: {
              data01: 'data01',
              data02: 'data02',
              data03: 'data03',
            },
          });
        res = await request(server)
          .post('/vendor/upload')
          .set('Authorization', 'Bearer ' + token)
          .send({
            recordType: 'test01',
            dataObject: {
              data01: 'data01',
              data02: 'data02',
              data03: 'data03',
            },
          });
        expect(res.statusCode).toEqual(409);
      });
      describe('DELETE /vendor/:id', () => {
        let token;
        beforeEach(async () => {
          let res = await request(server).post('/login').send(vendorUser);
          token = res.body.token;
        });
        it.each([adminUser, verifierUser])(
          'should return 403 Forbidden without an vendor role',
          async (account) => {
            res = await request(server).post('/login').send(account);
            const accountToken = res.body.token;
            res = await request(server)
              .delete(`/vendor/1234`)
              .set('Authorization', 'Bearer ' + accountToken);
            expect(res.statusCode).toEqual(403);
          }
        );
        it('should return 400 Bad Request if personal record id is an invalid ID', async () => {
          res = await request(server)
            .delete('/vendor/1234')
            .set('Authorization', 'Bearer ' + token);
          expect(res.statusCode).toEqual(400);
        });
        it('should remove a personal record by id', async () => {
          res = await request(server)
            .post('/vendor/upload')
            .set('Authorization', 'Bearer ' + token)
            .send({
              recordType: 'test01',
              dataObject: {
                data01: 'data01',
                data02: 'data02',
                data03: 'data03',
              },
            });
          const storedPersonalRecord = {
            ...res.body,
            _id: res.body._id.toString(),
            userId: res.body.userId.toString(),
          };
          res = await request(server)
            .delete(`/vendor/${storedPersonalRecord._id}`)
            .set('Authorization', 'Bearer ' + token);
          expect(res.body.acknowledged).toEqual(true);
          res = await UserData.findOne({
            _id: storedPersonalRecord._id,
          }).lean();
          expect(res).toBeNull();
        });
      });
    });
  });
});
