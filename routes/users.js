var express = require('express');
var router = express.Router();
var User = require('../lib/user');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');



/*Get the login page*/
router.get('/',function(req, res){
    if(!req.session.user){ //not logged in
    	res.render('userViews/index');
    } else { // logged in
    	//TODO: confirm sign out dialog
    }
});

//Checks to see if user is logged in with session
router.get('/dashboard', function(req, res){
    if(!req.session.user){
        return res.status(500).send();
    }

    return res.status(200).send("User logged in");
});

router.get('/logout', function(req, res){
    req.session.destroy();
    return res.status(200).send('Logged out');
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '10kb' }));

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
     			return res.status(200).send();
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

