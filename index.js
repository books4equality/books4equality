var express = require('express'),
    http = require('http'),
    path = require('path'),
    less = require('less-middleware'),
    engine = require('ejs-locals'),
    favicon = require('serve-favicon'),
    health = require('express-ping'),
    logger = require('./services/logger'),
    routes = require('./routes/index');

var app = express();
app.use(health.ping());

app.disable('x-powered-by');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', engine);

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(less(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use(function notFound(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    logger.warn(err);
    
    res.status(err.status || 500);
    res.render('error', {
        message: err.message
    });
});

var server = http.createServer(app);
server.listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080, function() {
    logger.info('b4e listening on', server.address());
});

process.on('SIGTERM', function onsigterm() {
    server.close(function onclose() {
        process.exit(0);
    });
});
