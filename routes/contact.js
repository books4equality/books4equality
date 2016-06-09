var express = require('express'),
    mailer = require('../services/mailer'),
    router = express.Router(); 

/**
 * @param {mailList} list of emails to send to
 * @param {args} obj contains 'name','email','message'
 *
 */
router.post('/sendContactEmail',function(req, res, next){
    var to = ['contact@books4equality.com','tobehowe@books4equality.com'];
    //Check for required fields
    if(!req.body.cName || !req.body.email || !req.body.message){
        return res.status(400).send('Missing Params');
    }

    var subject = 'B4E contact page message';
    //TODO: Add a nice html template for emails
    var html = '<h2>Message from: ' + req.body.cName + 
        ' (<a href="mailto:' + req.body.email + '">' + req.body.email + '</a>)</h2>' +
        '<p>' + req.body.message + '</p>';

    
    mailer.mail(to, subject, '', html, function(err, message){
        if(err){ 

            return res.status(500).send(err);
        } else {
            return res.status(200).send(message);
        }
    });
});

module.exports = router;