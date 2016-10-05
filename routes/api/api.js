'use strict'

/***
api.js includes all of the routes for the public api

*/

var express = require('express'),
  cors = require('cors'),
  books = require('../../services/books'),
  bodyParser = require('body-parser'),
  organizations = require('../../services/organizations'),
  utils = require('../../services/utils'),
  router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json({ limit: '10kb' }))
router.use(cors()) // CORS support allows third-party sites to consume the API

router.get('/', function(req, res) {
  return res.json({status: 1})
})

// i.e. /books?title=anatomy&categories=lang:en,anatomy
router.get('/books', function(req, res, next) {
  var options = utils.sanitize(req.query)

  books.find(options, function(err, books) {
    if (err) {
      return next(err)
    }

        // TODO remove private information

    return res.json(books)
  })
})

router.get('/books/:id', function(req, res, next) {
  books.findOne(req.params.id, function(err, book) {
    if (err) {
      return next(err)
    }

        // TODO remove private information
    return res.json(book)
  })
})

router.get('/organizations', function(req, res, next) {
  var options = utils.sanitize(req.query)

  organizations.find(options, function(err, organizations) {
    if (err) {
      return next(err)
    }

    organizations.forEach(function removePrivateInformation(org) {
      delete org.password
      delete org.email
      if (org.logo) {
        delete org.logo.data
      }
    })

    return res.json(organizations)
  })
})

module.exports = router
