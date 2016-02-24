var express = require('express'),
    books = require('../services/books');

var router = express.Router();

var currentUser = String;


router.get('/', function(req, res, next) {
    res.render('index',
    	{ 'page_name' : 'index'}
    );

    //console.log(res.locals.logged_in);
});

router.get('/contact', function(req, res, next) {
    res.render('contact',
    	{ 'page_name' : 'contact' }
    );
});

router.get('/library', function(req, res, next) {
    res.render('library',
    	{ 'page_name' : 'library' }
    );
});

router.get('/mission', function(req, res, next) {
    res.render('mission',
    	{ 'page_name' : 'mission' }
    );
});

router.get('/schedule', function(req, res, next) {
    res.render('schedule',
    	{ 'page_name' : 'schedule' }
    );
});

router.get('/about_us', function(req, res, next) {
    res.render('about_us',
    	{ 'page_name' : 'about_us' }
    );
});

router.get('/users', function(req, res, next) {
	res.render('userViews/login',
    	{ 'page_name' : 'sign_up' }
    );
});


module.exports = router;
