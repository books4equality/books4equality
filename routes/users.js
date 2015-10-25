var express = require('express'),
    login = require('connect-ensure-login'),
    passport = require('passport'),
    logger = require('../services/logger'),
    config = require('../config'),
    FacebookStrategy = require('passport-facebook').Strategy,
    users = require('../services/users');

passport.use(new FacebookStrategy(config.facebook,
  function verify(accessToken, refreshToken, profile, done) {
      logger.debug('profile: %j', profile);

      users.register(profile, function(err, user) {
          if (err) {
              return done(null, false, err);
          } else {
              return done(null, profile);
          }
      });
    }
));

passport.serializeUser(function serialize(user, done) {
    logger.debug('serialize %j', user);
    done(null, user);
});

passport.deserializeUser(function deserialize(user, done) {
    logger.debug('deserialize %j', user);
    done(null, user);
});

var router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

router.get('/auth/facebook',
    passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/users/login?success=false',
        successRedirect: '/users/profile'
    })
);

router.get('/users/logout', function(req, res) {
    req.logout();
    res.redirect('/users/login');
});

router.get('/users/profile',
    login.ensureLoggedIn('/users/login'),
    function(req, res, next) {
        res.render('users/profile');
    }
);

router.get('/users/login',
    login.ensureNotLoggedIn('/users/profile'),
    function(req, res, next) {
        res.render('users/login');
    }
);

module.exports = router;
