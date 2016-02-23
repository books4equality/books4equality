var express = require('express'),
    session = require('express-session'),
    subdomain = require('express-subdomain'),
    MongoStore = require('connect-mongo')(session),
    http = require('http'),
    path = require('path'),
    less = require('less-middleware'),
    engine = require('ejs-locals'),
    favicon = require('serve-favicon'),
    logger = require('./services/logger'),
    db = require('./services/db'),
    books = require('./services/books'),
    routes = require('./routes/index'),
    api = require('./routes/api'),
    users = require('./routes/users'),
    config = require('./config'),
    admin = require('./routes/admin'),
    organizations = require('./routes/organizations'),
    schoolRoutes = require('./routes/schools')
    schools = require('./services/schools'),
    async = require('async');


function initializeApplication() {
    var app = express();

    app.disable('x-powered-by');

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.engine('ejs', engine);

    app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(less(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'public')));

    //TODO: Make secret env var
    app.use(session({
        store: new MongoStore({ db: db.get() }),
        saveUninitialized: false,
        resave: false,
        secret: 'b4e-secret'
    }));

    app.use(function populateLocals(req, res, next) {
        res.locals.user = req.user;
        res.locals.config = config;
        res.locals.page_name = 'undefined';

        if(req.session.user){
            res.locals.loggedIn = req.session.user.email;
            if(typeof req.session.user.admin != 'undefined'){
                res.locals.admin = req.session.user.admin;
            }
        }

        books.stats(function(err, stats) {
            if (err) {
                return next(err);
            }
            res.locals.stats = stats;
            return next();
        });
    });

    /*
      In order to have the app.use() calls in server.js, I need to make a call
      to schools.findSchools and loop through the results. Unfortunately by the
      time that finishes, the server has already started, but without our
      subdomains. So I'm using async to run these last two chunks of code in
      series.
    */
    async.series([
      function(callback) { // create school subdomains
        schools.findSchools(function(err, schools) {
          if (err) {
            return callback(err);
          }
          for (var i = 0; i < schools.length; i++) {
            var schoolID = schools[i].shortName;
            var pageText = schools[i].pageText;
            schoolRoutes.createSchool(pageText, function(err, route) {
              if (err) {
                return callback(err);
              }

              app.use(subdomain(schoolID, route));
            });
          }

          return callback(null);
        });
      },
      function(callback) { // do everything else
        app.use('/', routes);
        app.use('/api', api);
        app.use('/', admin);
        app.use('/', organizations);
        app.use('/users', users);

        app.use(function notFound(req, res, next) {
            var err = new Error('Resource not Found');
            err.status = 404;
            return callback(err);
        });

        app.use(function(err, req, res, next) {
            logger.warn(err);

            res.status(err.status || 500);

            if (req.is('json')) {
                res.json({'error': err.message});
            } else {
                res.render('error', {
                    message: err.message
                });
            }
        });

        var server = http.createServer(app);
        var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3200;
        var host = process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";

        server.listen(port, host, function() {
            logger.info('b4e listening on', server.address());
        });

        process.on('SIGTERM', function() {
            logger.info('SIGTERM received, try ordered shutdown');
            server.close(function() {
                db.disconnect(function() {
                    process.exit(0);
                });
            });
        });

        return callback(null);
      }
    ]); // end of async.series
}

db.connect(function(err) {
    if (err) {
        process.exit(1);
    }

    initializeApplication();
});
