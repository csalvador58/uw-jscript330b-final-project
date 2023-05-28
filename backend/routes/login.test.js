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
    describe('POST /updateUser', () => {});
    describe('POST /updatePassword', () => {});
    describe('POST /addUserData', () => {});
    describe('GET /user', () => {});
    describe('GET /userData', () => {});
    describe('PUT /createUser', () => {});
    describe('PUT /addUserData', () => {});
  });
  describe('after user is created in the system', () => {
    describe('POST /', () => {});
  });
  describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
    beforeEach(async () => {
      await request(server).post('/login/user').send(adminUser);
      await request(server).post('/login/user').send(vendorUser);
      await request(server).post('/login/user').send(verifierUser);
    });
    describe('POST /', () => {});
  });
  describe('after admin, vendor, and verifier users are logged in', () => {
    let adminToken;
    let vendorToken;
    let verifierToken;
  });

  describe('', () => {});
  describe('', () => {});
});
