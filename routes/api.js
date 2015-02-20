var express = require('express'),
    cors = require('cors'),
    books = require('../services/books');

var router = express.Router();

router.use(cors()); // CORS support allows third-party sites to consume the API

router.get('/tags', function(req, res, next) {
    books.tags(function(err, tags) {
        if (err) {
            return next(err);
        }

        return res.json(tags);
    })
});

router.get('/books', function(req, res, next) {
    books.find({}, function(err, books) {
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
