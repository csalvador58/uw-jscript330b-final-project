const User = require('../models/user');
const UserData = require('../models/userData');
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { mongoose } = require('mongoose');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
// secret will not be visible in code
const secret = 'secretKey';

module.exports = {};

module.exports.createUser = (newUserObj) => {
  return new Promise((resolve, reject) => {
    bcrypt
      .hash(newUserObj.password, saltRounds)
      .then(async (hashedPassword) => {
        try {
          const newUserObjWithHashedPassword = {
            ...newUserObj,
            password: hashedPassword,
          };
          const storedUser = await User.create(newUserObjWithHashedPassword);
          resolve(storedUser);
        } catch (e) {
          if (e.message.includes('duplicate key')) {
            reject(new BadDataError('Email already exist'));
          } else if (e.message.includes('Cast to')) {
            reject(new TypeError('Invalid input data'));
          } else {
            reject(new Error(e.message));
          }
        }
      });
  });
};

module.exports.getUserByField = async (keyValuePair) => {
  // console.log('DAOs - keyValuePair');
  // console.log(keyValuePair);

  try {
    let query = Object.keys(keyValuePair).includes('_id')
      ? new mongoose.Types.ObjectId(keyValuePair._id)
      : keyValuePair;

    const user = await User.findOne(query).lean();
    return user;
    // if (user) return user;
    // throw new Error('User does not exist');
  } catch (e) {
    // console.log('DAO Error - e');
    // console.log(e.message);
    if (
      e.message.includes(
        'must be a string of 12 bytes or a string of 24 hex characters'
      ) ||
      e.message.includes('ObjectId failed')
    ) {
      throw new BadDataError('Invalid data input');
    } else {
      throw new Error(e.message);
    }
  }
};

module.exports.getUsersByGroupId = async (id) => {
  try {
    const users = await User.find({ groupId: id }).lean();
    // console.log('DAOS - users by id');
    // console.log(users);
    if (users.length > 0) return users;
    throw new Error('No accounts found by groupId');
  } catch (e) {
    if (e.message.includes('No accounts found')) {
      throw new BadDataError(e.message);
    } else {
      throw new Error(e.message);
    }
  }
};

module.exports.removeUserById = async (userId) => {
  console.log('DAOs - userId');
  console.log(userId);
  try {
    const deletedUser = await User.deleteOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    // console.log('deletedUser');
    // console.log(deletedUser);
    if (deletedUser.deletedCount) {
      // throw new Error('Invalid ID');
      // delete user data if any exist
      const deletedUserData = await UserData.deleteOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
    }

    // console.log('deletedUserData')
    // console.log(deletedUserData)

    return deletedUser;
  } catch (e) {
    // console.log('DAOs error');
    // console.log(e.message);
    if (
      e.message.includes('Invalid ID') ||
      e.message.includes(
        'must be a string of 12 bytes or a string of 24 hex characters'
      )
    ) {
      throw new BadDataError(e.message);
    } else {
      throw new Error(e.message);
    }
  }
};

module.exports.updatePassword = async (userId, newPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(newPassword, saltRounds).then(async (hashedPassword) => {
      try {
        // console.log('TEST user DAOS - userId');
        // console.log(userId);
        const updatedPassword = await User.findByIdAndUpdate(
          new mongoose.Types.ObjectId(userId),
          {
            password: hashedPassword,
          },
          { new: 1 }
        );
        resolve(updatedPassword);
      } catch (e) {
        reject(new Error(e.message));
      }
    });
  });
};

module.exports.updateUser = (userId, newData) => {
  return new Promise(async (resolve, reject) => {
    // console.log('DAO update');
    // console.log(userId);
    // console.log(newData);
    if (newData.password) {
      bcrypt.hash(newData.password, saltRounds).then(async (hashedPassword) => {
        try {
          // console.log('TEST user DAOS - userId');
          // console.log(userId);
          const updatedUser = await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(userId),
            {
              ...newData,
              password: hashedPassword,
            },
            { new: 1 }
          );
          resolve(updatedUser);
        } catch (e) {
          if (e.message.includes('duplicate key')) {
            reject(new BadDataError('Email already exist'));
          } else {
            reject(new Error(e.message));
          }
        }
      });
    } else {
      try {
        // console.log('TEST user DAOS - userId');
        // console.log(userId);
        const updatedUser = await User.findByIdAndUpdate(
          new mongoose.Types.ObjectId(userId),
          {
            ...newData,
          },
          { new: 1 }
        );
        resolve(updatedUser);
      } catch (e) {
        if (e.message.includes('duplicate key')) {
          reject(new BadDataError('Email already exist'));
        } else {
          reject(new Error(e.message));
        }
      }
    }
  });
};

// module.exports.verifyToken = async (token) => {
//   try {
//     return await jwt.verify(token, secret);
//   } catch (e) {
//     throw new BadDataError(`Invalid token: ${e.message}`);
//   }
// };

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
class TypeError extends Error {}
module.exports.TypeError = TypeError;
