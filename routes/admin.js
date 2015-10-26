'use strict';

var express = require('express'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    isbn = require('node-isbn'),
    bodyParser = require('body-parser'),
    books = require('../services/books'),
    logger = require('../services/logger');

var ADMIN_PASS = process.env.OPENSHIFT_APP_UUID ||
                 process.env.ADMIN_PASS || Math.random().toString(36).substring(7);

logger.info('Administrative password', ADMIN_PASS)

passport.use(new BasicStrategy(
    function(username, password, done) {
        if (password !== ADMIN_PASS) {
            logger.warn('Authentication failed');
            return done(null, false);
        }

        var user = {};
        return done(null, user);
    }
));

var router = express.Router();

router.use(passport.initialize());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '10kb' }));

var basicAuth = passport.authenticate('basic', {session: false});

router.get('/admin', basicAuth, function(req, res) {
    return res.render('admin/index');
});

router.get('/search/:isbn', basicAuth, function(req, res, next) {
    isbn.resolve(req.params.isbn, function(err, book) {
        if (err) {
            return next(err);
        }

        return res.json(book);
    });
});

router.post('/api/books', basicAuth, function(req, res, next) {
    var start = Date.now();
    isbn.resolve(req.body.isbn, function(err, book) {
        if (err) {
            logger.warn('Not able to resolve %s', req.body.isbn, err);
            return next(err);
        }

        // TODO check whether the barcode (req.body.barcode) already exists

        // complete book with custom fields
        book._meta = {};
        book._meta.isbn = req.body.isbn;
        book._meta.barcode = req.body.barcode;
        book._meta.creationDate = new Date();
        book._meta.available = true;

        var start = Date.now();
        books.insert(book, function(err, result) {
            var elapsed = Date.now() - start;
            logger.info('Book insert %d, err:%s', elapsed, err);

            if (err) {
                return next(err);
            }

            if (req.is('json')) {
                return res.json(result);
            }

            return res.redirect('/admin'); // redirect after post pattern
        });
    });
});

router.delete('/api/books/:id', basicAuth, function(req, res, next) {
    books.remove(req.params.id, function(err, result) {
        if (err) {
            return next(err);
        }

        if (req.is('json')) {
            return res.json(result);
        }

        return res.redirect('/admin');
    });
});

module.exports = router;
