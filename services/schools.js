'use strict'

var db = require('./db')

function findSchools(callback) {
  db.get().collection('schools').find({}, { _id: 0, schoolID: 1, pageText: 1 }).toArray(function (err, schools) {
    if (err) {
      return callback(err)
    }
    return callback(null, schools)
  })
}

function getSchoolIDs(callback) {
  db.get().collection('schools').find({}, { _id: 0, schoolID: 1 }).toArray((err, schools) => {
    if (err) return callback(err)
    return callback(null, schools)
  })
}

function getSchoolUsers(schoolID, callback) {
  const criteria = { schoolID }
  const filter = { password: 0 }
  db.get().collection('users').find(criteria, filter).toArray((err, users) => {
    if(err) return callback(err)
    return callback(null, users)
  })
}

module.exports = {
  findSchools,
  getSchoolIDs,
  getSchoolUsers
}
