var express = require('express'),
    cors = require('cors'),
    books = require('../services/books');
    organizations = require('../services/organizations');

var router = express.Router();

router.use(cors()); // CORS support allows third-party sites to consume the API

router.get('/', function(req, res, next) {
    return res.json({status: 1});
});

// i.e. /books?title=anatomy&categories=lang:en,anatomy
router.get('/books', function(req, res, next) {
    var options = req.query;

    books.find(options, function(err, books) {
        if (err) {
            return next(err);
        }

        return res.json(books);
    })
});



router.get('/books/:id', function(req, res, next) {
    books.findOne(req.params.id, function(err, book) {
        if (err) {
            return next(err);
        }

        return res.json(book);
    })
});

module.exports = router;
