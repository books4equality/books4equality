'use strict'

var express = require('express'),
	School = require('../lib/models/school'),
	bodyParser = require('body-parser'),
	router = express.Router()

router.use(bodyParser.urlencoded({
	extended: true
}))
router.use(bodyParser.json({
	limit: '10kb'
}))

router.get('/', function(req, res) {
	School.find({}, 'schoolID schoolName', function(err, schools) {
		if(err) return res.status(500).send()
		res.render('schools/schoolList', {
			schools
		})
	})
})

//register a new school
router.post('/register', function(req, res) {
	//Required parameters
	var required = ['schoolID', 'password', 'schoolName']
	required.forEach(function(param) {
		if(!req.body[param]) {
			return res.status(400).send()
		}
	})

	School.findOne({
		schoolID: req.body.schoolID
	}, function(err, school) {
		if(err) {
			return res.status(500).send()
		}
		if(school) {
			return res.status(409).send()
		} //409 conflict

		var newSchool = new School()
		newSchool.schoolID = req.body.schoolID
		newSchool.password = req.body.password
		newSchool.schoolName = req.body.schoolName

		newSchool.save(newSchool, function(err, result) {
			if(err) {
				console.log(err)
				return res.status(500).send()
			}

			req.session.school = newSchool
				//204 No Content
			return res.status(204).send()
		})
	})
})

// router.get('/info/:schoolID', function(req,res){
//   School.findOne({schoolID: req.params.schoolID}, 'schoolID schoolName', function(err, school){
//   if(err) { return res.statsu(500).send() }
//   if(!school) { return res.status(404).send() }
//   return res.status(200).send(school)
// })
// })


/***
 Req: 
schoolID: String (required)
password: String (required)
res:
500 (db error)
401 (bad user/pass combo)
204 (awww yeaaahhhh)
*/
router.post('/login', function(req, res) {
	//Required parameters
	var required = ['schoolID', 'password']
	required.forEach(function(param) {
		if(!req.body[param]) {
			return res.status(400).send()
		}
	})

	School.findOne({
		schoolID: req.body.schoolID
	}, function(err, school) {
		if(err) {
			return res.status(500).send()
		}
		if(!school) {
			return res.status(401).send()
		}

		school.comparePassword(req.body.password, function(err, isMatch) {
			if(err) {
				return res.status(500).send()
			}
			if(isMatch && isMatch == true) {

				req.session.school = req.body.schoolID
				return res.status(204).send()
			}


			return res.status(401).send()
		})
	})
})

router.post('/logout', function(req, res) {
	req.session.destroy()
})


//TODO: Add these following routes for schools using users as models

/*

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
var password = req.body.password;
var firstName = req.body.firstName;
var lastName = req.body.lastName;
var email = req.body.email;

var newUser = new User();
//newUser.username = username;
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


*/

module.exports = router
