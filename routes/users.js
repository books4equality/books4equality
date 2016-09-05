'use strict';
//Packages
var express = require('express'),
    async = require('async'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    request = require('request'),
    crypto = require('crypto'),
    router = express.Router();
//Local
var User = require('../lib/models/user'),
    userServices = require('../services/users.js'),
    mailer = require('../services/mailer.js'),
    books = require('../services/books.js');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '10kb' }));


router.get('/goodbye', function(req,res){
  return res.render('userViews/goodbye');
});

/*Get the login page*/
router.get('/',function(req, res){
  return res.render('userViews/login');
});

//Loads page to confirm the book reservation
router.get('/reserveBook',function(req,res){
  var book = {};
  if(req.session.user){//logged in
    books.findOneByBarcode(req.query.barcode, function(err, book){
      if(err){
        return next(err);
      }
      return res.render('userViews/confirmBook', {book:book});
    });
  } else{
    return res.render('userViews/login');
  }
});

//Update books after confirm dialog
//This route actually reserves the book after the user confirms
router.post('/reserveBookConfirmed', function(req,res){	
  if(req.session.user){

    var userInfo = {
      email: req.session.user.email,
      reservedDate: new Date()
    };

    var criteria = {'_meta.barcode': req.body.barcode,'_meta.available': true};
    var set = {
      $set:{'_meta.available':false,'_meta.reservedBy': userInfo},
      $push: { '_meta.reservedDates': userInfo.reservedDate }
    };

    books.updateBook(criteria, set, function(err, result){
      if(err){
        return res.status(500).send();
      }

      return res.status(200).send();
    });
  } else {
    return res.status(401).send();
  }
});

router.post('/markTabled', (req, res) => {
  var date = new Date()
  if(req.session.user.admin && req.session.user.admin == true) {
    var criteria = { '_meta.barcode': req.body.barcode }
    console.log(criteria)
    var set = {
      $set: { '_meta.tabled': true },
      $push: { '_meta.tabledDates': date }
    }
    books.updateBook(criteria, set, (err, result) => {
      console.log(err,result)
      if(err) return res.status(500).send()
      return res.status(200).send()
    })
  } else {
    return res.status(401).send()
  }
})

router.get('/doesUserExist', function(req, res){
  userServices.findOne(req.query.email, function(err, result){
    if(err){ return res.status(500).send(); }
    if(result == null){ return res.status(200).send(); } //No error, but user DNE

    return res.status(290).send();  //user exists status
  });
});

router.get('/getUsersBooks', function(req, res){
  var criteria = {'_meta.reservedBy.email': req.session.user.email};

  books.findUsersBooks(criteria, function(err, books){
    if(err){ return res.status(500).send();}
    if(books == null || books == {}){ return res.status(200).send(); }
    return res.status(290).send(books);
  });

});

router.get('/userHome', function(req,res){
  if(!req.session.user){
    return res.status(401).send();
  }

  return res.render('userViews/userHome',
      {'page_name':'user_home'}
      );
});

router.post('/unreserveBook', function(req,res){
  var book = {};

  books.findReservedBookByBarcode(req.body.barcode, function(err, book){
    if(err){return res.status(500).send(); }

    books.unreserveBook(req.body.barcode, req.session.user, book, function(err, auth, result){
      if(err){ return res.status(500).send(); }

      if(!auth){ return res.status(401).send();  }

      return res.status(200).send();
    });
  });
});

router.post('/signOutBook', function(req,res){
  books.findReservedBookByBarcode(req.body.barcode, function(err, book){
    if(err) return res.status(500).send()
    books.signOutBook(req.body.barcode, req.session.user, function(err, auth, result){
      if(err) return res.status(500).send()
      if(!auth) return res.status(401).send()
      return res.status(200).send()
    })
  })
})

router.post('/signInExistingBook', function(req,res){
  var book = {};

  books.findReservedBookByBarcode(req.body.barcode, function(err, book){
    if(err){return res.status(500).send(); }

    books.signInExistingBook(req.body.barcode, req.session.user, book, 
        function(err, auth, result){
      if(err){ return res.status(500).send(); }

      if(!auth){ return res.status(401).send();  }

      return res.status(200).send();
    });
  });
});

// Logout screen
router.get('/logout',function(req, res){
  //console.log(req.session.user);
  res.locals.user = req.session.user;
  res.render('userViews/logout'
      );
});

//Checks to see if user is logged in with session
router.get('/dashboard', function(req, res){
  if(!req.session.user){
    return res.status(500).send();
  }

  return res.status(200).send();
});

router.post('/logout', function(req, res){
  req.session.destroy();
  var message = {'success':true}
  return res.status(200).send(message);
});

//TODO: Handle not found better
//users/login
router.post('/login', function(req,res){
  //var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({email: email}, function(err, user){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    if(!user) {
      return res.status(401).send();
    }

    user.comparePassword(password, function(err,isMatch){
      if(isMatch && isMatch == true){
        req.session.user = user;
        return res.status(200).send(isMatch);
      } else {
        return res.status(401).send();
      }
    });
  });
});

//users/register
router.post('/register', function(req, res){
  //var username = req.body.username;
  var password = req.body.password
  var firstName = req.body.firstName
  var lastName = req.body.lastName
  var email = req.body.email
  var school = req.body.school
  var creationDate = Date.now()

  var newUser = new User();
  //newUser.username = username;
  newUser.password = password
  newUser.firstName = firstName
  newUser.lastName = lastName
  newUser.email = email
  newUser.schoolID = school
  newUser.creationDate = creationDate

  //TODO: Have warnings come up if failure or success
  newUser.save(newUser, function(err, result){
    if(err){
      console.log(err);
      return res.status(500).send()
    }
    req.session.user = newUser
    return res.status(200).send(result)
  })

});

router.delete('/deleteAccount', function(req,res){
  //var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({email: email}, function(err, user){
    if(err){
      console.log(err);
      return res.status(500).send();
    }
    if(!user) {
      return res.status(401).send();
    }

    user.comparePassword(password, function(err,isMatch){
      if(isMatch && isMatch == true){
        User.findOne({ email: email }).remove().exec();
        return res.status(200).send();
      } else {
        return res.status(401).send();
      }
    });
  });
});

/**
 * @param {email} String: Email address to reset
 *
 *
 */
router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    return res.status(400).send("No user with that email exists");
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var to = user.email;
            var subject = 'B4E password reset';
            var text = 'You are receiving this because you (or someone else) ' + 
            'have requested the reset of the password for your books4equality account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n';

            mailer.mail(to, subject, text, '', function(err, message){
                if(err){
                    return res.status(500).send(err);
                }
                res.status(200).send(message);
            });
        }
        ], 
        function(err) {
            if (err) return res.status(500).send(err);
            return res.status(200).send("Success");
            // res.redirect('/forgot');
        });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, 
        resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            return res.render('userViews/reset',{
                error: 'Password reset token is invalid or has expired.'
            });
        }
        return res.render('userViews/reset', {
            email: user.email,
            token: req.params.token
        });
    });
});

router.post('/reset/updatePassword', function(req, res){
    if(!req.body.token || !req.body.password) {
        return res.status(500).send("Missing parameters");
    }

    User.findOne({ resetPasswordToken: req.body.token, 
        resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if(err) {
            return res.status(500).send("Server error");
        }
        if (!user) {
            return res.status(500).send("Server error 2");
        }
        //update password
        // user.password = req.body.password;
        user.updatePassword(req.body.password, function(err, message){
            if(err){
                return res.status(500).send("Update Error");
            }
            return res.status(200).send(message);
        });
    });
});

module.exports = router;

