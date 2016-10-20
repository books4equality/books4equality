'use strict'

var db = require('../db')
var async = require('async')
/**
 * Collection of stats for the school stats page.
 */
function accounts(schoolID, callback) {
  db.get().collection('users')
  .find({'schoolID': schoolID})
  .count((err, count) => {
    if(err) return callback(err)
    return callback(null, count)
  })
}

function adminAccounts(schoolID, callback) {
  db.get().collection('users')
  .find({'schoolID': schoolID, 'admin': true})
  .count((err, count) => {
    if(err) return callback(err)
    return callback(null, count)
  })
}

function books(schoolID, callback) {
  db.get().collection('books')
  .find({'_meta.schoolID': schoolID})
  .count((err, count) => {
    if(err) return callback(err)
    return callback(null, count)
  })
}

function booksOnReserve(schoolID, callback) {
  db.get().collection('books')
  .find({'_meta.schoolID': schoolID, '_meta.reservedBy': { $exists: 1 }})
  .count((err, count) => {
    if(err) return callback(err)
    return callback(null, count)
  })
}

function booksGivenOut(schoolID, callback) {
  db.get().collection('books')
  .find({'_meta.signOutInfo': { $exists: 1 }})
  .count((err, count) => {
    if(err) return callback(err)
    return callback(null, count)
  })
}

/**
 * Helper function to gather all stats into one object
 */
function getAllStats(schoolID, outerCallback) {
  async.parallel({
    books: function getBooks(callback) {
      books(schoolID, (err, count) => {
        if(err) return callback(err)
        return callback(null, count)
      })
    },
    booksOnReserve: function getBooksOnReserve(callback) {
      booksOnReserve(schoolID, (err, count) => {
        if(err) return callback(err)
        return callback(null, count)
      })
    },
    booksGivenOut: function getBooksGivenOut(callback) {
      booksGivenOut(schoolID, (err, count) => {
        if(err) return callback(err)
        return callback(null, count)
      })
    },
    accounts: function getAccounts(callback) {
      accounts(schoolID, (err, count) => {
        if(err) return callback(err)
        return callback(null, count)
      })
    },
    adminAccounts: function getAdminAccounts(callback) {
      adminAccounts(schoolID, (err, count) => {
        if(err) return callback(err)
        return callback(null, count)
      })
    }
  },
  function(err, results) {
    if(err) return outerCallback(err)
    return outerCallback(null, results)
  })
}


module.exports = {
  getAllStats
}