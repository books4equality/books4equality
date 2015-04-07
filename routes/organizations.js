'use strict';

var crypto = require("crypto"),
    express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    multer = require('multer'),
    login = require('connect-ensure-login'),
    ObjectID = require('mongodb').ObjectID,
    validations = require('../middlewares/validations'),
    organizations = require('../services/organizations'),
    logger = require('../services/logger');

passport.use(new LocalStrategy(
    function(username, password, done) {
        var passwordHash = crypto.createHash("sha256").update(password, "utf8").digest("base64");

        var criteria = {
            email: username,
            password: passwordHash
        };

        organizations.findOne(criteria, function(err, organization) {
            if (err) {
                logger.info('user auth failed %j', err);
                return done(null, false, err);
            } else {
                logger.info('user info %j', organization);
                return done(null, organization);
            }
        })
    }
));

passport.serializeUser(function serialize(user, done) {
    logger.debug('serialize %j', user);
    done(null, user);
});

passport.deserializeUser(function deserialize(user, done) {
    logger.debug('deserialize %j', user);
    return done(null, user);
});

var router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

router.use(bodyParser.urlencoded({ extended: true }));

var fileUploadOptions = {
  inMemory: true, // XXX might not scale well !
  limits: { files: 1 },
  putSingleFilesInArray: true // XXX will be the default value in future multer releases
};
router.use(multer(fileUploadOptions));

router.get('/organizations',
    function(req, res, next) {
        res.render('organizations/index');
    }
);

router.get('/organizations/login',
    function(req, res, next) {
        res.render('organizations/login');
    }
);

router.get('/organizations/home',
    login.ensureLoggedIn('/organizations/login'),
    function(req, res, next) {
        res.render('organizations/home');
    }
);

router.post('/organizations/login',
    login.ensureNotLoggedIn(),
    passport.authenticate('local', {
        successRedirect: '/organizations/home',
        failureRedirect: '/organizations/login?unauthorized'
    })
);

router.get('/organizations/logout',
    function(req, res) {
        req.logout();
        res.redirect('/organizations');
    }
);

router.get('/organizations/:id/logo',
    // XXX could use Etag headers to cache images in the browser and save some juice
    function(req, res) {
        var criteria = {
            _id: new ObjectID(req.params.id) // XXX routers shouldn't know about mongo details
        };
        organizations.findOne(criteria, function(err, organization) {
            if (err) {
                // TODO serve empty image
                res.set('Content-Type', 'image/png');
                return res.status(200);
            }

            res.set('Content-Length', organization.logo.size);
            res.set('Content-Type', organization.logo.mimetype);
            res.write(organization.logo.data.buffer);
            res.end();
        });
    }
);

router.post('/organizations/signup',
    validations.validate('organization'),
    function(req, res, next) {
        var passwordHash = crypto.createHash("sha256").update(req.body.password, "utf8").digest("base64");
        var organization = {
            email: req.body.email,
            password: passwordHash, // do not store plain password
            location: req.body.location,
            name: req.body.name,
            numberBooks: 0,
            outreach: 0,
            createdAt: new Date()
        };

        if (req.files.logo) {
            organization.logo = {
                mimetype: req.files.logo[0].mimetype,
                size: req.files.logo[0].size,
                data: req.files.logo[0].buffer // XXX works with inMemory multer, otherwise read from logo.path
            };
        }
        organizations.insert(organization, function(err, result) {
            if (err) {
                return next(new Error('Not able to create organization'));
            }

            return res.redirect('/organizations/login');
        });
    }
);

module.exports = router;
