const UserData = require('../models/userData');
const mongoose = require('mongoose');

module.exports = {};

module.exports.uploadData = async (userId, type, data) => {
  console.log('DAOs - userId');
  console.log(userId);
  console.log('type');
  console.log(type);
  console.log('data');
  console.log(data);
  try {
    const uploadedData = await UserData.create({
      userId: new mongoose.Types.ObjectId(userId),
      recordType: type,
      dataObject: data,
    });
    return uploadedData;
  } catch (e) {
    console.log('DAO - e.message');
    console.log(e.message);
    if (e.message.includes('duplicate key')) {
      throw new BadDataError('Record type already exist');
    } else {
      throw new Error(e.message);
    }
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
