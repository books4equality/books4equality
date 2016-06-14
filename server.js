var express = require('express'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    http = require('http'),
    path = require('path'),
    less = require('less-middleware'),
    engine = require('ejs-locals'),
    favicon = require('serve-favicon'),
    logger = require('./services/logger'),
    db = require('./services/db'),
    mongoose = require('./services/mongoose.js'),
    books = require('./services/books'),
    routes = require('./routes/index'),
    contact = require('./routes/contact'),
    bodyParser = require('body-parser'),
    api = require('./routes/api/api'),
    schools = require('./routes/schools.js'),
    users = require('./routes/users'),
    config = require('./config'),
    admin = require('./routes/api/admin'),
    organizations = require('./routes/organizations');


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

    app.use('/', routes);
    app.use('/api', api);
    app.use('/admin', admin);
    app.use('/', organizations);
    app.use('/users', users);
    app.use('/schools', schools);
    app.use('/contact', contact);

    app.use(function notFound(req, res, next) {
        var err = new Error('Resource not Found');
        err.status = 404;
        next(err);
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
}

db.connect(function(err) {
    if (err) {
        process.exit(1);
    }
    mongoose.connect();

    initializeApplication();
});
