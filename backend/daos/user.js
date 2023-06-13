const User = require('../models/user');
const UserData = require('../models/userData');
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
  try {
    let query = Object.keys(keyValuePair).includes('_id')
      ? new mongoose.Types.ObjectId(keyValuePair._id)
      : keyValuePair;

    const user = await User.findOne(query).lean();
    return user;
  } catch (e) {
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

module.exports.getUsersBySearch = async (searchQuery) => {
  try {
    // const users = await User.find({ searchQuery }).lean();
    const users = await User.find(
      { $text: { $search: searchQuery } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    if (users.length > 0) return users;
    throw new BadDataError('No accounts found by search query');
  } catch (e) {
    if (e instanceof BadDataError) {
      throw e;
    } else {
      throw new Error(e.message);
    }
  }
};

module.exports.removeUserById = async (userId) => {
  try {
    const deletedUser = await User.deleteOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (deletedUser.deletedCount) {
      const deletedUserData = await UserData.deleteOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
    }
    return deletedUser;
  } catch (e) {
    if (
      e.message.includes('Invalid ID') ||
      e.message.includes(
        'must be a string of 12 bytes or a string of 24 hex characters'
      )
    ) {
      throw new BadDataError('Invalid ID');
    } else {
      throw new Error(e.message);
    }
  }
};

module.exports.updatePassword = async (userId, newPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(newPassword, saltRounds).then(async (hashedPassword) => {
      try {
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

module.exports.updateUser = async (userId, newData) => {
  try {
    if (newData.password) {
      const hashedPassword = await bcrypt.hash(newData.password, saltRounds);
      newData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      newData,
      { new: true }
    );

    return updatedUser;
  } catch (e) {
    if (e.message.includes('duplicate key')) {
      throw new BadDataError('Email already exists');
    } else if (
      e.message.includes(
        'must be a string of 12 bytes or a string of 24 hex characters'
      )
    ) {
      throw new BadDataError('Invalid user ID');
    } else {
      throw new Error(e.message);
    }
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
class TypeError extends Error {}
module.exports.TypeError = TypeError;
