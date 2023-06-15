const request = require('supertest');
const server = require('../server');
const testUtils = require('../test-utils');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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
  const verifierUser = {
    email: 'VerifierEmail@email.com',
    password: 'verifier123!',
    roles: ['verifier'],
    name: 'verifier account',
    phone: '2063334444',
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
  describe('after user is created in the system', () => {
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
    describe('POST /', () => {
      it('should return 401 Unauthorized response when the email is not found in system', async () => {
        const res = await request(server).post('/login').send({
          email: 'testBadEmail@email.com',
          password: '123456!',
        });
        expect(res.statusCode).toEqual(401);
      });
      describe.each([adminUser, vendorUser, verifierUser])(
        'User %s ',
        (account) => {
          it.each(['email', 'password'])(
            'should return 400 Bad request when the %s is missing',
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
          const res = await request(server).post('/login').send(vendorUser);
          expect(res.statusCode).toEqual(500);
        });
      });
    });
    describe('PUT /updatePassword/:id?', () => {
      it('should return 401 Unauthorized response with an invalid token', async () => {
        const res = await request(server)
          .put('/login/updatePassword')
          .set('Authorization', 'Bearer BAD')
          .send({ password: 'validPassword0!' });
        expect(res.statusCode).toEqual(401);
      });
      it('should return 401 Unauthorized response with an invalid token', async () => {
        const res = await request(server)
          .put('/login/updatePassword')
          .set('Authorization', 'BearerBAD')
          .send({ password: 'validPassword0!' });
        expect(res.statusCode).toEqual(401);
      });
      it('should return 400 Bad request when an admin tries to update a user password with an incorrect userId ', async () => {
        let res = await request(server).post('/login').send(adminUser);
        const adminLoginToken = res.body.token;
        res = await request(server)
          .put('/login/updatePassword/1234')
          .set('Authorization', 'Bearer ' + adminLoginToken)
          .send({
            password: 'validPassword0!',
          });
        expect(res.statusCode).toEqual(400);
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
          it('should return 200 OK response when an admin updates a target user password', async () => {
            let res = await request(server).post('/login').send(adminUser);
            const adminLoginToken = res.body.token;
            const { _id: userAccountId, password: oldHashedPassword } =
              await User.findOne({ email: account.email }).lean();
            res = await request(server)
              .put(`/login/updatePassword/${userAccountId.toString()}`)
              .set('Authorization', 'Bearer ' + adminLoginToken)
              .send({ password: 'validPassword0!' });
            expect(res.statusCode).toEqual(200);
            const { password: newHashedPassword } = await User.findOne({
              email: account.email,
            }).lean();
            expect(newHashedPassword).not.toEqual(oldHashedPassword);
            expect(newHashedPassword).not.toEqual('validPassword0!');
          });
        }
      );
      describe.each([vendorUser, verifierUser])('Non-admin %s', (account) => {
        it('should return 400 Bad request when attempting to change a target user password', async () => {
          let res = await request(server).post('/login').send(account);
          const accountToken = res.body.token;

          // create test target account
          let targetTestAccount = {
            ...account,
            email: 'targetAccount@email.com',
          };
          await request(server)
            .post('/admin/createUser')
            .set('Authorization', 'Bearer ' + adminToken)
            .send(targetTestAccount);
          const targetUser = await User.findOne({
            email: 'targetAccount@email.com',
          }).lean();
          res = await request(server)
            .put(`/login/updatePassword/${targetUser._id.toString()}`)
            .set('Authorization', 'Bearer ' + accountToken)
            .send({ password: 'validPassword0!' });
          expect(res.statusCode).toEqual(400);
        });
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
          let res = await request(server).post('/login').send(adminUser);
          const adminLoginToken = res.body.token;
          const { _id: userAccountId, password: oldHashedPassword } =
            await User.findOne({ email: vendorUser.email }).lean();
          res = await request(server)
            .put('/login/updatePassword')
            .set('Authorization', 'Bearer ' + adminLoginToken)
            .send({ userId: userAccountId, password: 'validPassword0!' });
          expect(res.statusCode).toEqual(500);
        });
      });
    });
  });
});
