var express = require('express'),
    books = require('../services/books');

var router = express.Router();

var currentUser = String;


router.get('/', function(req, res, next) {
    res.render('index');

    //console.log(res.locals.logged_in);
});

router.get('/contact', function(req, res, next) {
    res.render('contact');
});

router.get('/library', function(req, res, next) {
    res.render('library');
});

router.get('/mission', function(req, res, next) {
    res.render('mission');
});

router.get('/schedule', function(req, res, next) {
    res.render('schedule');
});

router.get('/about_us', function(req, res, next) {
    res.render('about_us');
});

router.get('/users', function(req, res, next) {
	res.render('userViews/login');
});


module.exports = router;
