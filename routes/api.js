var express = require('express'),
    cors = require('cors'),
    books = require('../services/books');

var router = express.Router();

router.use(cors()); // CORS support allows third-party sites to consume the API

router.get('/', function(req, res, next) {
    return res.json({status: 1});
});

router.get('/tags', function(req, res, next) {
    books.tags(function(err, tags) {
        if (err) {
            return next(err);
        }

        return res.json(tags);
    })
});

// i.e. /books?title=anatomy&tags=lang:en,anatomy
router.get('/books', function(req, res, next) {
    var options = {};

    if (req.query.title) {
        options.title = req.query.title;
    }
    if (req.query.tags) {
        options.tags = req.query.tags;
    }
    if (req.query.orderby) {
        options.orderby = req.query.orderby;
    }

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
