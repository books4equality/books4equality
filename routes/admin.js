'use strict';

var express = require('express'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    isbn = require('node-isbn'),
    logger = require('../services/logger');

passport.use(new BasicStrategy(
    function(username, password, done) {
        // TODO
        if (password !== 'admin') {
            logger.warn('Authentication failed');
            return done(null, false);
        }

        var user = {};
        return done(null, user);
    }
));

var router = express.Router();

router.use(passport.initialize());

router.get('/', passport.authenticate('basic'), function(req, res) {
    return res.render('admin/index');
});

router.get('/isbn/:isbn', passport.authenticate('basic'), function(req, res, next) {
    isbn.resolve(req.params.isbn, function(err, book) {
        if (err) {
            return next(err);
        }

        return res.json(book);
    });
});

module.exports = router;
