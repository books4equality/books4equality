var express = require('express'),
    nodemailer = require('nodemailer'),
    bodyParser = require('body-parser'),
    validator = require("email-validator"),
    router = express.Router(); 

router.post('/sendMail',function(req, res, next){

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

    var mailList = ['contact@books4equality.com','tobehowe@books4equality.com'];

    var errors = [];
    
    mailList.forEach(function(targetEmail){
        mailOpts = {
            from: req.body.contact.cName + ' &lt;' + req.body.contact.email + '&gt;',
            to: targetEmail,
            subject: 'B4E Contact message',
            text: 'Name: ' + req.body.contact.cName + '\n' +
                'Email: ' + req.body.contact.email + '\n' +
                'Message: ' + req.body.contact.message + '\n'
        };  
        

        smtpTrans.sendMail(mailOpts, function(error, info){
            errors.push('Error:  ' + error);
            console.log('Mail Info:  ' + info);
        });
    });


    if(errors.length != 0){
        console.log(errors);
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

module.exports = router;