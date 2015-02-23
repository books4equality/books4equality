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
router.use(bodyParser.json({ limit: '10kb' }));

router.get('/', passport.authenticate('basic', {session: false}), function(req, res) {
    return res.render('admin/index');
});

router.get('/search/:isbn', passport.authenticate('basic', {session: false}), function(req, res, next) {
    isbn.resolve(req.params.isbn, function(err, book) {
        if (err) {
            return next(err);
        }

        return res.json(book);
    });
});

router.post('/book', passport.authenticate('basic', {session: false}), function(req, res, next) {
    var book = req.body.book;

    books.insert(book, function(err, result) {
        if (err) {
            return next(err);
        }

        return res.json(result);
    });
});

module.exports = router;
