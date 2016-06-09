var express = require('express'),
nodemailer = require('nodemailer'),
validator = require("email-validator"),
router = express.Router();

/**
 * @param {to} string or an array containing recipient emails
 * @param {subject} string: subject of email
 * @param {text} String: string body of the email
 * @param {html} String: html body of the email
 * 
 */
function mail(to, subject, text, html, callback){
	// send mail with password confirmation
	var transporter = nodemailer.createTransport( {
	    service:  'Mailgun',
	    auth: {
	     user: 'postmaster@books4equality.com',
	     pass: 'fc2dbd2d4f0475cb4aed9e6f2bfa1f16'   
	    }
	});
	var mailOpts = {
	    from: 'B4E@books4equality.com',
	    to: to,
	    subject: subject,
	    text : text,
	    html : html
	};
	transporter.sendMail(mailOpts, function (err, response) {
	    if (err) {
	    	return callback(err);
	    } else {
	     	return callback(null, "Mail sent");
	    }
	});
}

module.exports = {
	mail: mail
}
