var express = require('express'),
    cors = require('cors'),
    books = require('../services/books'),
    nodemailer = require('nodemailer'),
    bodyParser = require('body-parser'),
    organizations = require('../services/organizations'),
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

router.post('/contact',function(req, res, next){

    //Check if required fields are filled
    if(!req.body.contact.cName || !req.body.contact.email || !req.body.contact.message) {
        res.render('contact', {
                title: 'Contact',
                page: 'Contact',
                type: 'empty',
                description: 'Email not successfully sent.'
            });
        return;
    }

    //check if valid email
    var email_check = validator.validate(req.body.contact.email);

    if(email_check == false){
        res.render('contact', {
                title: 'Contact',
                page: 'Contact',
                type: 'error',
                description: 'Email not successfully sent.'
            });
        return;
    }

    //Setup mailer
    var mailOpts, smtpTrans;
   
    var EMAIL_USER = process.env.GMAIL_SMTP_USER,
        EMAIL_PASS = process.env.GMAIL_SMTP_PASS;


    //Setup nodemailer transport    
    smtpTrans = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    //Only for if we are using the custom transporter, ie. gmail etc not direct
    
    mailOpts = {
        from: req.body.contact.cName + ' &lt;' + req.body.contact.email + '&gt;',
        to: 'contact@books4equality.com',
        subject: 'B4E Contact message',
        text: 'Name: ' + req.body.contact.cName + '\n' +
            'Email: ' + req.body.contact.email + '\n' +
            'Message: ' +req.body.contact.message + '\n'
    };  
    

    smtpTrans.sendMail(mailOpts, function(error, info){
        //Email not sent
        if(error){
            res.render('contact', {
                title: 'Contact',
                page: 'Contact',
                type: 'error',
                description: 'Email not successfully sent.'
            });
        }else{
            res.render('contact',{
                title: 'contact',
                page: 'contact',
                type: 'success',
                description: 'Email successfully sent'
            });
        }
    });
});

module.exports = router;
