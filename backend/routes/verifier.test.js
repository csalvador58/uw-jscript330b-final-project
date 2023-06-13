const request = require('supertest');
const server = require('../server');
const mongoose = require('mongoose');
const testUtils = require('../test-utils');
const User = require('../models/user');
const UserData = require('../models/userData');
const zkTestAPI = require('../apis/zkTestAPI');
const { validateUserRecord } = require('../apis/zkTestAPI');

describe('/verifier', () => {
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
    phone: '4251235555',
    groupId: adminGroupId,
  };
  const vendorUser = {
    email: 'VendorEmail@email.com',
    password: 'vendor123!',
    roles: ['vendor'],
    name: 'vendor account',
    phone: '2061112222',
    groupId: vendorGroupId,
  };
  const vendorUser2 = {
    email: 'VendorEmail2@email.com',
    password: 'vendor1232!',
    roles: ['vendor'],
    name: 'vendor account2',
    phone: '2065556666',
    groupId: vendorGroupId,
  };
  const verifierUser = {
    email: 'VerifierEmail@email.com',
    password: 'verifier123!',
    roles: ['verifier'],
    name: 'verifier account',
    phone: '2063334444',
    groupId: verifierGroupId,
  };
  const verifierUser2 = {
    email: 'VerifierEmail2@email.com',
    password: 'verifier1232!',
    roles: ['verifier'],
    name: 'verifier account2',
    phone: '2060001111',
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
  describe('Before login', () => {
    describe('GET /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .get('/verifier')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('POST /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .get('/verifier/1234')
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('PUT /', () => {
      it('should return 401 Unauthorized response without a valid token', async () => {
        let res = await request(server)
          .put('/verifier')
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
        let res = await request(server).post('/login').send(verifierUser);
        token = res.body.token;
      });
      it.each([adminUser, vendorUser])(
        'should return 403 Forbidden if %s does not have a verifier role',
        async (account) => {
          res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;
          res = await request(server)
            .get('/verifier')
            .set('Authorization', 'Bearer ' + accountToken)
            .send();
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 200 OK response and the verifier user info', async () => {
        let user = await User.findOne({ email: verifierUser.email }).lean();
        user._id = user._id.toString();
        res = await request(server)
          .get('/verifier')
          .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(user);
      });
      describe('server failure', () => {
        let originalFn;
        beforeEach(() => {
          originalFn = User.findOne;
          User.findOne = jest.fn().mockImplementation(() => {
            throw new Error('Server Error');
          });
        });
        afterEach(() => (User.findOne = originalFn));
        it('should return 500 Internal Server error if a server error occurs', async () => {
          res = await request(server)
            .get('/verifier')
            .set('Authorization', 'Bearer ' + token);
          expect(res.statusCode).toEqual(500);
        });
      });
    });
    describe('zero knowledge verification on a personal record - POST /verifier/:id', () => {
      let token;
      beforeEach(async () => {
        let res = await request(server).post('/login').send(verifierUser);
        token = res.body.token;
      });
      it.each([adminUser, vendorUser])(
        'should return 403 Forbidden if %s does not have a verifier role',
        async (account) => {
          res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;
          res = await request(server)
            .post('/verifier/1234')
            .set('Authorization', 'Bearer ' + accountToken);
          expect(res.statusCode).toEqual(403);
        }
      );
      it('should return 400 Bad Request if required fields are invalid', async () => {
        res = await request(server)
          .post('/verifier/1234')
          .set('Authorization', 'Bearer ' + token)
          .send();
        expect(res.statusCode).toEqual(400);
      });
      it('should return 400 Bad Request if personal record id is invalid', async () => {
        res = await request(server)
          .post('/verifier/1234')
          .set('Authorization', 'Bearer ' + token)
          .send({ test: 'test' });
        expect(res.statusCode).toEqual(400);
      });
      describe('mock zk external component', () => {
        let postValidateUserRecord;
        afterEach(() => {
          postValidateUserRecord.mockRestore();
        });
        it('should return 200 OK and a boolean result to the proving request', async () => {
          postValidateUserRecord = jest.spyOn(zkTestAPI, 'validateUserRecord');
          postValidateUserRecord.mockResolvedValue(true);

          testRecord = await UserData.create({
            userId: new mongoose.Types.ObjectId(res.body._id),
            recordType: 'test01',
            dataObject: {
              data01: 'data01',
              data02: 'data02',
              data03: 'data03',
            },
          });
          testRecord._id = testRecord._id.toString();
          res = await request(server)
            .post(`/verifier/${testRecord._id}`)
            .set('Authorization', 'Bearer ' + token)
            .send({ test: 'test' });
          expect(res.statusCode).toEqual(200);
          expect(typeof res.body.results).toBe('boolean');
        });
      });
    });
    describe('PUT /', () => {
      let token;
      beforeEach(async () => {
        let res = await request(server).post('/login').send(verifierUser);
        token = res.body.token;
      });
      it.each([adminUser, vendorUser])(
        'should return 403 Forbidden for %s without a vendor role',
        async (account) => {
          res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;
          res = await request(server)
            .put('/verifier')
            .set('Authorization', 'Bearer ' + accountToken);
          expect(res.statusCode).toEqual(403);
        }
      );
      describe('updating vendor user info - PUT /', () => {
        it('should return 400 Bad Request if updating a restricted field', async () => {
          res = await request(server)
            .put('/verifier')
            .set('Authorization', 'Bearer ' + token)
            .send({
              roles: ['admin'],
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request without a valid email', async () => {
          res = await request(server)
            .put('/verifier')
            .set('Authorization', 'Bearer ' + token)
            .send({
              email: 'invalidEmail',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request if password is invalid', async () => {
          res = await request(server)
            .put('/verifier')
            .set('Authorization', 'Bearer ' + token)
            .send({
              password: 'invalidPassword',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 400 Bad Request if the phone is invalid', async () => {
          res = await request(server)
            .put('/verifier')
            .set('Authorization', 'Bearer ' + token)
            .send({
              phone: '123456',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 200 OK with valid data', async () => {
          res = await request(server)
            .put('/verifier')
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
            .put('/verifier')
            .set('Authorization', 'Bearer ' + token)
            .send({
              email: verifierUser2.email,
            });
          expect(res.statusCode).toEqual(409);
        });
        it('should not store a raw password', async () => {
          const { password: oldHashedPassword } = await User.findOne({
            email: verifierUser.email,
          }).lean();
          res = await request(server)
            .put('/verifier')
            .set('Authorization', 'Bearer ' + token)
            .send({
              password: 'newPassword0!',
            });
          const { password: newHashedPassword } = await User.findOne({
            email: verifierUser.email,
          }).lean();
          expect(newHashedPassword).not.toEqual(oldHashedPassword);
          expect(newHashedPassword).not.toEqual('newPassword0!');
        });
        describe('server failure', () => {
          let originalFn;
          beforeEach(() => {
            originalFn = User.findByIdAndUpdate;
            User.findByIdAndUpdate = jest.fn().mockImplementation(() => {
              throw new Error('Server Error');
            });
          });
          afterEach(() => (User.findByIdAndUpdate = originalFn));
          it('should return 500 Internal Server error if a server error occurs', async () => {
            res = await request(server)
              .put('/verifier')
              .set('Authorization', 'Bearer ' + token)
              .send({
                email: 'UpdatedEmail@email.com',
              });
            expect(res.statusCode).toEqual(500);
          });
        });
      });
    });
  });
});
