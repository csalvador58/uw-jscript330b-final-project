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

  describe('before user is created in the system', () => {
    describe('POST /', () => {
      it('should return 401 Unauthorized response', async () => {
        const res = await request(server).post('/login').send(adminUser);
        expect(res.statusCode).toEqual(401);
      });
    });
  });
  describe('POST /', () => {
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
    it('should return 401 Unauthorized response when the email is not found in system', async () => {
      const res = await request(server).post('/login').send({
        email: 'testBadEmail@email.com',
        password: '123456!',
      });
      expect(res.statusCode).toEqual(401);
    });
    describe.each([adminUser, vendorUser, verifierUser])(
      'User %#',
      (account) => {
        it.each(['email', 'password'])(
          'should return 400 Bad request when the email or password is missing',
          async (key) => {
            const testUser = {
              ...account,
              [key]: '',
            };
            const res = await request(server).post('/login').send(testUser);
            expect(res.statusCode).toEqual(400);
          }
        );
        it('should return 401 Unauthorized response when the password does not match', async () => {
          const res = await request(server)
            .post('/login')
            .send({
              ...account,
              password: 'incorrectPassword0!',
            });
          expect(res.statusCode).toEqual(401);
        });
        it('should return 200 OK response and a new token when the login is valid', async () => {
          const res = await request(server).post('/login').send(account);
          expect(res.statusCode).toEqual(200);
          expect(res.body.token).toBeDefined();
        });
        it('should return a JWT token with only the user email, _id, and roles.', async () => {
          const userAccount = await User.findOne({
            email: account.email,
          }).lean();
          const res = await request(server)
            .post('/login')
            .send({ email: account.email, password: account.password });
          const token = res.body.token;
          const decodedToken = jwt.decode(token);
          expect(decodedToken.email).toEqual(userAccount.email);
          expect(decodedToken._id).toEqual(userAccount._id.toString());
          expect(decodedToken.roles).toEqual(userAccount.roles);
          expect(decodedToken.password).toBeUndefined();
        });
      }
    );
  });
  describe('PUT /updatePassword', () => {
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
    it('should return 401 Unauthorized response with an invalid token', async () => {
      const res = await request(server)
        .put('/login/updatePassword')
        .set('Authorization', 'Bearer BAD')
        .send({ password: 'validPassword0!' });
      expect(res.statusCode).toEqual(401);
    });
    describe.each([adminUser, vendorUser, verifierUser])(
      'User %#',
      (account) => {
        it('should return 400 Bad request with an invalid password - password must be at least 6 characters, include a number and a special character, no spaces', async () => {
          let res = await request(server).post('/login').send(account);
          const token = res.body.token;
          res = await request(server)
            .put('/login/updatePassword')
            .set('Authorization', 'Bearer ' + token)
            .send({ password: 'invalidPassword' });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 200 OK response when a valid user updates own password', async () => {
          let res = await request(server).post('/login').send(account);
          const token = res.body.token;
          const { password: oldHashedPassword } = await User.findOne({
            email: account.email,
          }).lean();
          res = await request(server)
            .put('/login/updatePassword')
            .set('Authorization', 'Bearer ' + token)
            .send({ password: 'validPassword0!' });
          expect(res.statusCode).toEqual(200);
          const { password: newHashedPassword } = await User.findOne({
            email: account.email,
          }).lean();
          expect(newHashedPassword).not.toEqual(oldHashedPassword);
          expect(newHashedPassword).not.toEqual('validPassword0!');
        });
        it('should return 400 Bad request when an admin tries to update a user password with an incorrect userId ', async () => {
          let res = await request(server).post('/login').send(adminUser);
          const adminLoginToken = res.body.token;
          res = await request(server)
            .put('/login/updatePassword')
            .set('Authorization', 'Bearer ' + adminLoginToken)
            .send({
              userId: 'invalidUserId000f1b2a0by',
              password: 'validPassword0!',
            });
          expect(res.statusCode).toEqual(400);
        });
        it('should return 200 OK response when an admin updates a target user password', async () => {
          let res = await request(server).post('/login').send(adminUser);
          const adminLoginToken = res.body.token;
          const { _id: userAccountId, password: oldHashedPassword } =
            await User.findOne({ email: account.email }).lean();
          res = await request(server)
            .put('/login/updatePassword')
            .set('Authorization', 'Bearer ' + adminLoginToken)
            .send({ userId: userAccountId, password: 'validPassword0!' });
          expect(res.statusCode).toEqual(200);
          const { password: newHashedPassword } = await User.findOne({
            email: account.email,
          }).lean();
          expect(newHashedPassword).not.toEqual(oldHashedPassword);
          expect(newHashedPassword).not.toEqual('validPassword0!');
        });
      }
    );
  });
});
