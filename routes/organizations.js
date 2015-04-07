'use strict';

var crypto = require("crypto"),
    express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    multer = require('multer'),
    login = require('connect-ensure-login'),
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
router.use(multer());

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
    function logout(req, res) {
        req.logout();
        res.redirect('/organizations');
    }
);

router.post('/organizations/signup',
    function(req, res, next) {
        // TODO validate format, existing orgs, etc. with 'revalidator'
        // TODO upload logo (use multer, req.files)

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

        organizations.insert(organization, function(err, result) {
            if (err) {
                return next(new Error('Not able to create organization'));
            }

            return res.redirect('/organizations/login');
        });
    }
);

module.exports = router;
