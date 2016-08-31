'use strict';

var express = require('express'),
  books = require('../services/books'),
  logger = require('../services/logger'),
  router = express.router();


router.post('/api/books', basicAuth, function (req, res, next) {
  var start = Date.now();
  var clicker = {};
  clicker.clicker = req.body.isbn;
  clicker.barcode = req.body.barcode;
  clicker.donor_email = req.body.donor_email;
  clicker.creationDate = new Date();
  clicker.available = true;

  books.insertClicker(clicker, function (err, result) {
    var elapsed = Date.now() - start;
    logger.info('iClicker insert %d, err:%s', elapsed, err);

    if (err) {
      return next(err);
    }

    if (req.is('json')) {
      return res.json(result);
    }

    return res.redirect('/admin');//redirect after post patern
  });

});