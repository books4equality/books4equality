'use strict';

var express = require('express'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    isbn = require('node-isbn'),
    bodyParser = require('body-parser'),
    books = require('../../services/books'),
    logger = require('../../services/logger'),
    //schools = require('../services/schools')
    School = require('../../lib/models/school');

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

/***
The /admin routes are for the admin page on the website

The /api routes in this file are for the public api routes which require
basic auth


*/

router.get('/reserveList', function(req,res){//require admin account
    var notAuthorizedMessage = 'Tsk tsk... Unauthorized. Please sign into an administrative account.';

    if(typeof req.session.user == 'undefined'){ 
        return res.status(401).send(notAuthorizedMessage);
    }
    if(typeof req.session.user.admin == 'undefined' || req.session.user.admin == false){
        return res.status(401).send(notAuthorizedMessage);
    }

    return res.render('admin/reserveList'); 
});

router.get('/reservedBooks', function(req,res){
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


router.post('/books', function(req, res, next) {    

    //Required parameters
    var required = ['schoolID', 'isbn','barcode','password'];
    required.forEach(function(param){
        if(!req.body[param]){
            return res.status(400).send();
        }
    });

    isbn.resolve(req.body.isbn, function(err, book) {
        if (err) {
            logger.warn('Not able to resolve %s', req.body.isbn, err);
            return res.status(269).send(); //ISBN not resolved, handle in front end
            //return next(err);
        }

        var criteria = {schoolID: req.body.schoolID};
        var password = req.body.password

        School.findOne(criteria, function(err, school){
            if(err){                
                return res.status(500).send();
            }

            if(!school){
                console.log('School ' + req.body.schoolID + ' DNE');
                return res.status(401).send();
            }

            school.comparePassword(password, function(err, isMatch){
                if(isMatch && isMatch == true){
                    //password verified allow insert....

                    // TODO check whether the barcode (req.body.barcode) already exists
                    // handle error instead of throwing

                    // complete book with custom fields
                    book._meta = {};
                    book._meta.isbn = req.body.isbn;
                    book._meta.barcode = req.body.barcode;
                    book._meta.ddc = req.body.ddc;
                    book._meta.donor_email = req.body.donor_email;
                    book._meta.creationDate = new Date();
                    book._meta.available = true;
                    book._meta.schoolID = req.body.schoolID;



                    books.insert(book, function(err, result) {
                        if (err) {
                            console.log(err);
                            if(err.code == 11000){
                                return res.status(409).send();  //duplicate key, conflicting data
                            }
                            return res.status(500).send();
                        }

                        //Success: returns 204 No Content
                        if(result){
                            return res.status(204).send();
                        }

                        return res.redirect('/admin'); // redirect after post pattern
                    });

                } else { //Incorrect Password
                    console.log('Incorrect password');
                    return res.status(401).send();
                }   
            });
        });
    });
});


router.delete('/books/:id', basicAuth, function(req, res, next) {
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
