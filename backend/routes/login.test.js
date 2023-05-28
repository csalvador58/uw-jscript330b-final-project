const request = require('supertest');

const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');

describe('/login', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const adminUser = {};
  const vendorUser = {};
  const verifierUser = {};

  describe('before user is created in the system', () => {
    describe('POST /', () => {});
    describe('POST /createUser', () => {});
    describe('POST /updatePassword', () => {});
  });
  describe('after user is created in the system', () => {
    describe('POST /', () => {});
  });
  describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
    beforeEach(async () => {
      await request(server).post('/login/createUser').send(adminUser);
      await request(server).post('/login/createUser').send(vendorUser);
      await request(server).post('/login/createUser').send(verifierUser);
    });
    describe('POST /', () => {});
  });
  describe('after admin, vendor, and verifier users are logged in', () => {
    let adminToken;
    let vendorToken;
    let verifierToken;
    beforeEach(async () => {
      await request(server).post('/login/createUser').send(adminUser);
      const response01 = await request(server).post('/login').send(adminUser);
      adminToken = response01.body.token;
      await request(server).post('/login/createUser').send(vendorUser);
      const response02 = await request(server).post('/login').send(vendorUser);
      vendorToken = response02.body.token;
      await request(server).post('/login/createUser').send(verifierUser);
      const response03 = await request(server)
        .post('/login')
        .send(verifierUser);
      verifierToken = response03.body.token;
    });
    describe('POST /updatePassword', () => {});
  });
});
