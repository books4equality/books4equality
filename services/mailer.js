'use strict';

var nodemailer = require('nodemailer'),
		express = require('express'),
		router = express.router(),
		var console = require('console').Console;
	
    router.use(express.bodyParser());

router.post('/', function(request, response){

    console.log(request.body.contact.name);
    console.log(request.body.contact.email);
    console.log(request.body.contact.message);

});
/*
function mail(to,from,subject,text){	
	var transporter = nodemailer.createTransport();
	transporter.sendMail({
	    from: 'sender@address',
	    to: 'receiver@address',
	    subject: 'hello',
	    text: 'hello world!'
	});

}

*/