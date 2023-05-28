const request = require('supertest');

const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');

describe('/login', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  describe('before user is created in the system', () => {
    describe('POST /', () => {});
    describe('POST /updateUser', () => {});
    describe('POST /updatePassword', () => {});
    describe('GET /user', () => {});
    describe('GET /userData', () => {});
    describe('PUT /user', () => {});
    describe('PUT /userData', () => {});
  });
  describe('after user is created in the system', () => {
    describe('POST /', () => {});
    describe('', () => {});
    describe('', () => {});
    describe('', () => {});
    describe('', () => {});
    describe('', () => {});
  });
});
