var express = require('express'),
    router = express.Router();

var STATIC_PAGES = ['about', 'impact', 'contact'];

router.get('/', function(req, res, next) {
  res.render('index');
});

STATIC_PAGES.forEach(function(page) {
    router.get('/' + page, function(req, res, next) {
        res.render(page);
    });
});

module.exports = router;
