const request = require('supertest');

const server = require('../server');
const testUtils = require('../test-utils');

const User = require('../models/user');

// describe.skip('/admin', () => {
//   beforeAll(testUtils.connectDB);
//   afterAll(testUtils.stopDB);

//   afterEach(testUtils.clearDB);

//   const adminUser = {
//     email: 'testAdminEmail@email.com',
//     password: 'admin123',
//     roles: 'admin',
//     name: 'admin account',
//     phone: '2061234567',
//     vendorGroupdId: '0',
//     verifierGroupdId: '0',
//   };
//   const vendorUser = {
//     email: 'testVendorEmail@email.com',
//     password: 'vendor123',
//     roles: 'vendor',
//     name: 'vendor account',
//     phone: '2061112222',
//     vendorGroupdId: '111111111',
//     verifierGroupdId: '0',
//   };
//   const verifierUser = {
//     email: 'testVerifierEmail@email.com',
//     password: 'verifier123',
//     roles: 'verifier',
//     name: 'verifier account',
//     phone: '2063334444',
//     vendorGroupdId: '0',
//     verifierGroupdId: '333333333',
//   };

//   describe.each([adminUser, vendorUser, verifierUser])('User %#', (user) => {
//     beforeEach(async () => {
//       await request(server).post('/login/createUser').send(adminUser);
//       await request(server).post('/login/createUser').send(vendorUser);
//       await request(server).post('/login/createUser').send(verifierUser);
//     });
//     describe('Before login', () => {
//       describe('GET /', () => {
//         it('should return 401 Unauthorized response without a valid token', async () => {
//           // code here
//           expect(res.statusCode).toEqual(401);
//         });
//       });
//       describe('POST /', () => {
//         it('should return 401 Unauthorized response without a valid token', async () => {
//           // code here
//           expect(res.statusCode).toEqual(401);
//         });
//       });
//       describe('PUT /', () => {
//         it('should return 401 Unauthorized response without a valid token', async () => {
//           // code here
//           expect(res.statusCode).toEqual(401);
//         });
//       });
//       describe('DELETE /', () => {
//         it('should return 401 Unauthorized response without a valid token', async () => {
//           // code here
//           expect(res.statusCode).toEqual(401);
//         });
//       });
//     });
//     describe('After login', () => {
//       describe('GET /', async () => {
//         it('should return 403 Forbidden without an admin role', async () => {
//           // code here
//           expect(res.statusCode).toEqual(403);
//         });
//         it('should return 200 OK with admin user info', async () => {
//           // code here
//           expect(res.statusCode).toEqual(200);
//         });
//       });
//       describe('GET /:id', () => {
//         it('should return 403 Forbidden without an admin role', async () => {
//           // code here
//           expect(res.statusCode).toEqual(403);
//         });
//         it('should return 400 Bad Request with an invalid userId', async () => {
//           // code here
//           expect(res.statusCode).toEqual(400);
//         });
//         it('should return the matching user by userId for a user with an admin role', async () => {
//           // code here
//           expect(res.statusCode).toEqual(200);
//         });
//         it('should return 204 No Content when no users are associated with a userId', async () => {
//           // code here
//           expect(res.statusCode).toEqual(204);
//         });
//       });
//       describe('GET /admin?vendorId=', async () => {
//         it('should return 403 Forbidden without an admin role', async () => {
//           // code here
//           expect(res.statusCode).toEqual(403);
//         });
//         it('should return all users with matching vendorId', async () => {
//           // code here
//           expect(res.statusCode).toEqual(200);
//         });
//         it('should return 204 No Content when no users are associated with a vendorId', async () => {
//           // code here
//           expect(res.statusCode).toEqual(204);
//         });
//       });
//       describe('GET /admin?verifierId=', async () => {
//         it('should return 403 Forbidden without an admin role', async () => {
//           // code here
//           expect(res.statusCode).toEqual(403);
//         });
//         it('should return all users with matching verifierId', async () => {
//           // code here
//           expect(res.statusCode).toEqual(200);
//         });
//         it('should return 204 No Content when no users are associated with a verifierId', async () => {
//           // code here
//           expect(res.statusCode).toEqual(204);
//         });
//       });
//       describe('GET /search?query=', () => {
//         it('should return 403 Forbidden without an admin role', async () => {
//           // code here
//           expect(res.statusCode).toEqual(403);
//         });
//         it('should return a limit of 5 users for a search based on name, email, or phone and sorted by best multiple terms', async () => {
//           // code here
//         });
//         it('should return 204 No Content when no users are associated with a verifierId', async () => {
//           // code here
//           expect(res.statusCode).toEqual(204);
//         });
//       });
//       describe('POST /', () => {
//         it('should return 401 without a valid token', async () => {
//           // code here
//           expect(res.statusCode).toEqual(401);
//         });
//         describe('creating a new user - POST /admin/createUser', () => {
//           it('should return 403 Forbidden if user does not have an admin role', async () => {
//             // code here
//             expect(res.statusCode).toEqual(403);
//           });
//           it('should return 400 Bad Request without a valid email', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 200 OK with a valid email', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return 400 Bad Request if password is invalid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 200 OK if password is valid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return 400 Bad Request without one or more roles assigned', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 200 OK with one or more roles assigned', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return 400 Bad Request if name is invalid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 200 OK if name is valid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return 400 Bad Request if phone is invalid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 200 OK if phone is valid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return 400 Bad Request if an admin role and vendorGroupId is not zero', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 400 Bad Request if an admin role and verifierGroupId is not zero', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 400 Bad Request if not a vendor role and vendorGroupId is valid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 400 Bad Request if a vendor role is selected and vendorGroupId is invalid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return 200 OK if a vendor role is selected and vendorGroupId is valid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return 400 Bad Request if not a verifier role and verifierGroupId is valid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 400 Bad Request if a verifier role is selected and verifierGroupId is invalid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return 200 OK if a verifier role is selected and verifierGroupId is valid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return a 409 Conflict if email already exist', async () => {
//             // code here
//             expect(res.statusCode).toEqual(409);
//           });
//           it('should not store a raw password', async () => {
//             // code here
//             // create a new user with admin role and receive a userId
//             // find the user with the userId
//             // check to make sure password is encrypted
//           });
//         });
//       });
//       describe('PUT /', () => {
//         it('should return 403 Forbidden without an admin role', async () => {
//           // code here
//           expect(res.statusCode).toEqual(403);
//         });
//         describe('updating admin user info - PUT /', () => {
//           it('should return 400 Bad Request if required fields are invalid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 200 OK with valid data', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return a 409 Conflict if email already exist', async () => {
//             // code here
//             expect(res.statusCode).toEqual(409);
//           });
//           it('should not store a raw password', async () => {
//             // code here
//             // create a new user with admin role and receive a userId
//             // find the user with the userId
//             // check to make sure password is encrypted
//           });
//         });
//         describe('updating email, phone, or password for a userId - PUT /admin/:id', () => {
//           it('should return 403 Forbidden without an admin role', async () => {
//             // code here
//             expect(res.statusCode).toEqual(403);
//           });
//           it('should return 400 Bad Request if required fields are invalid', async () => {
//             // code here
//             expect(res.statusCode).toEqual(400);
//           });
//           it('should return 200 OK with valid data', async () => {
//             // code here
//             expect(res.statusCode).toEqual(200);
//           });
//           it('should return a 409 Conflict if email already exist', async () => {
//             // code here
//             expect(res.statusCode).toEqual(409);
//           });
//           it('should not store a raw password', async () => {
//             // code here
//             // create a new user with admin role and receive a userId
//             // find the user with the userId
//             // check to make sure password is encrypted
//           });
//         });
//       });
//       describe('DELETE /admin/:id', () => {
//         it('should return 403 Forbidden without an admin role', async () => {
//           // code here
//           expect(res.statusCode).toEqual(403);
//         });
//         it('should return 405 Method Not Allowed if admin attempts to delete itself', async () => {
//           // code here
//           expect(res.statusCode).toEqual(405);
//         });
//         it('should return 400 Bad Request if userId is not in system', async () => {
//           expect(res.statusCode).toEqual(400);
//         });
//         it('should remove user and userData collections by userId', async () => {
//           // code here
//           // check user collection
//           // check userData collection
//         });
//       });
//     });
//   });
// });
