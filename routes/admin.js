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

router.get('/admin/reserveList', function(req,res){//require admin account
    var notAuthorizedMessage = 'Tsk tsk... Unauthorized. Please sign into an administrative account.';

    if(typeof req.session.user == 'undefined'){ 
        return res.status(401).send(notAuthorizedMessage);
    }
    if(typeof req.session.user.admin == 'undefined' || req.session.user.admin == false){
        return res.status(401).send(notAuthorizedMessage);
    }

    return res.render('admin/reserveList'); 
});

router.get('/admin/reservedBooks', function(req,res){
    var options = req.query;

    books.findReservedBooks(options, function(err, books){
        if(err){ return res.status(500).send(); }

        return res.status(200).send(books);
    });
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

    if(req.body.isbn == "999" || req.body.isbn == 999){
        var clicker = {};
            clicker.clicker = req.body.isbn;
            clicker.barcode = req.body.barcode;
            clicker.donor_email = req.body.donor_email;
            clicker.creationDate = new Date();
            clicker.available = true;

            var start = Date.now();
            books.insertClicker(clicker, function(err, result){
                var elapsed = Date.now() - start;
                logger.info('iClicker insert %d, err:%s', elapsed, err);
                
                if(err){
                    return next(err);
                }

                if(req.is('json')){
                    return res.json(result);
                }

                return res.redirect('/admin');//redirect after post patern
            });

    }else{
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
            book._meta.ddc = req.body.ddc;
            book._meta.donor_email = req.body.donor_email;
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


    }
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
