const UserData = require('../models/userData');
const mongoose = require('mongoose');

module.exports = {};

module.exports.getRecordById = async (recordId) => {
  try {
    const records = await UserData.findOne({
      _id: new mongoose.Types.ObjectId(recordId),
    }).lean();

    return records;
  } catch (e) {
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

module.exports.getUserWithRecords = async (userId) => {
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

module.exports.removeRecordById = async (recordId) => {
  try {
    const response = await UserData.deleteOne({
      _id: new mongoose.Types.ObjectId(recordId),
    });
    return response;
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

module.exports.uploadData = async (userId, type, data) => {
  try {
    const uploadedData = await UserData.create({
      userId: new mongoose.Types.ObjectId(userId),
      recordType: type,
      dataObject: data,
    });
    return uploadedData;
  } catch (e) {
    if (e.message.includes('duplicate key')) {
      throw new BadDataError('Record type already exist');
    } else if (e.message.includes('userData validation failed')) {
      throw new BadDataError('Invalid record type');
    } else {
      throw new Error(e.message);
    }
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
