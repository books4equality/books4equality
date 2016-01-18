var express = require('express');
var router = express.Router();
var User = require('../lib/user');
var userServices = require('../services/users.js');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var books = require('../services/books.js');

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
router.post('/reserveBookConfirmed', function(req,res){	
	if(req.session.user){

        var userInfo = {
            username: req.session.user.username,
            email: req.session.user.email
        };

	    var criteria = {'_meta.barcode': req.body.barcode,'_meta.available': true};
	    var set = {$set:{'_meta.available':false,'_meta.reservedBy': userInfo}};

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

router.get('/doesUserExist', function(req, res){
    var criteria = {'username': req.query.username};

    userServices.findOne(criteria, function(err, result){
        if(err){ return res.status(500).send(); }
        if(result == null){ return res.status(200).send(); }
        
        return res.status(290).send();  //user exists status
    });
});

router.get('/getUsersBooks', function(req, res){
    var criteria = req.body.criteria;
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
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username: username}, function(err, user){
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
    var username = req.body.username;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;

    var newUser = new User();
    newUser.username = username;
    newUser.password = password;
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.email = email;

    //TODO: Have warnings come up if failure or success
    newUser.save(newUser, function(err, result){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        	req.session.user = newUser;
        return res.status(200).send(result);
    })

});

router.delete('/deleteAccount', function(req,res){
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username: username}, function(err, user){
        if(err){
            console.log(err);
            return res.status(500).send();
        }
        if(!user) {
            return res.status(401).send();
        }

        user.comparePassword(password, function(err,isMatch){
        	if(isMatch && isMatch == true){
        		User.findOne({ username: username }).remove().exec();
     			return res.status(200).send();
        	} else {
 				return res.status(401).send();
        	}
        });
    });
});

module.exports = router;

