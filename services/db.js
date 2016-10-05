'use strict'

var MongoClient = require('mongodb').MongoClient,
  logger = require('./logger')

var db

var url = process.env.MONGO_URL ||'mongodb://localhost:27017/b4e'
if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
  url = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME
}

var connect = function connect(callback) {
  if (db) {
    process.nextTick(function() {
      callback(null, db)
    })
  } else {
    MongoClient.connect(url, function(err, database) {
      if (err) {
        logger.error('MongoDB connect FAIL')
        return callback(err)
      }

      logger.info('MongoDB connect OK')
      db = database
      return callback(err, db)
    })
  }
}

var disconnect = function disconnect(callback) {
  db.close(callback)
}

module.exports = {
  get: function() {
    return db
  },
  connect: connect,
  disconnect: disconnect
}
