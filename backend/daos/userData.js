const UserData = require('../models/userData');
const mongoose = require('mongoose');

module.exports = {};

module.exports.getAllRecords = async (userId) => {
  console.log('DAOs get all records');
  console.log('userId');
  console.log(userId);
  try {
    const userWithData = await UserData.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'accountInfo',
        },
      },
      {
        $group: {
          _id: '$userId',
          accountInfo: { $first: '$accountInfo' },
          dataRecords: {
            $push: {
              recordId: '$_id',
              recordType: '$recordType',
              dataObject: '$dataObject',
            },
          },
        },
      },
      { $unwind: '$accountInfo' },
      {
        $project: {
          _id: 0,
          accountInfo: 1,
          dataRecords: 1,
        },
      },
    ]);
    return userWithData[0];
  } catch (e) {
    throw new Error(e.message);
  }
};

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
