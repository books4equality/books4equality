var express = require('express'),
    cors = require('cors'),
    books = require('../../services/books'),
    nodemailer = require('nodemailer'),
    bodyParser = require('body-parser'),
    organizations = require('../../services/organizations'),
    validator = require("email-validator");
    //Console = console.Console;

var router = express.Router(); 


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '10kb' }));
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

        // TODO remove private information

        return res.json(books);
    })
});

router.get('/books/:id', function(req, res, next) {
    books.findOne(req.params.id, function(err, book) {
        if (err) {
            return next(err);
        }

        // TODO remove private information
        return res.json(book);
    })
});

router.get('/organizations', function(req, res, next) {
    var options = req.query;

    organizations.find(options, function(err, organizations) {
        if (err) {
            return next(err);
        }

        organizations.forEach(function removePrivateInformation(org) {
          delete org.password;
          delete org.email;
          if (org.logo) {
            delete org.logo.data;
          }
        });

        return res.json(organizations);
    })
});

module.exports = router;
