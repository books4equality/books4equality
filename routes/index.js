var express = require('express'),
    books = require('../services/books');

var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/contact', function(req, res, next) {
    res.render('contact');
});

router.get('/impact', function(req, res, next) {
    books.tags(function(err, tags) {
        if (err) {
            return next(err);
        }

        return res.render('impact', {tags: tags});
    });
});

module.exports = router;
