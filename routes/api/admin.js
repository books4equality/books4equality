'use strict';

/**
 * admin.js contains all of the book related routes that require 
 * an admin account to access
 *
 *
 */

var express = require('express'),
  isbn = require('node-isbn'),
  bodyParser = require('body-parser'),
  books = require('../../services/books'),
  logger = require('../../services/logger'),
  School = require('../../lib/models/school'),
  schools = require('../../services/schools')

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '10kb' }));

var notAuthorizedMessage =
  'Are you daft? Unauthorized.\n' +
  'Please sign into an administrative account.';

router.get('/', function (req, res) {
  if (typeof req.session.user == 'undefined') {
    return res.status(401).send(notAuthorizedMessage)
  }
  if (typeof req.session.user.admin == 'undefined' ||
    req.session.user.admin == false) {
    return res.status(401).send(notAuthorizedMessage)
  }

  return res.render('admin/index');
});

router.get('/bookRegistrationPage', (req, res) => {
  if (typeof req.session.user == 'undefined') {
    return res.status(401).send(notAuthorizedMessage)
  }
  if (typeof req.session.user.admin == 'undefined' ||
    req.session.user.admin == false) {
    return res.status(401).send(notAuthorizedMessage)
  }
  schools.getSchoolIDs((error, schools) => {
    if (error) return res.status(500).send()
    return res.render('admin/bookRegistration',
      {
        'page_name': 'bookRegistration',
        'schools': schools
      }
    )
  })
})

router.get('/reservedBooks', function (req, res) {
  var options = req.query;

  books.findReservedBooks(options, function (err, books) {
    if (err) { return res.status(500).send(); }

    return res.status(200).send(books);
  });
});


//TODO: Clean up with async
router.post('/getBookInfo', function (req, res, next) {

  //Required parameters
  var required = ['schoolID', 'barcode', 'isbn', 'password'];
  required.forEach(function (param) {
    if (!req.body[param]) {
      return res.status(400).send();
    }
  });

  var criteria = { schoolID: req.body.schoolID };
  var password = req.body.password

  School.findOne(criteria, function (err, school) {
    if (err) {
      return res.status(500).send();
    }

    if (!school) {
      console.log('School ' + req.body.schoolID + ' DNE');
      return res.status(401).send();
    }

    school.comparePassword(password, function (err, isMatch) {
      if (isMatch && isMatch == true) {
        //TODO: Add a barcode check, gets isbn and dewey code and returns them to the app
        books.findSchoolBookByBarcode(req.body.schoolID, req.body.barcode, function (err, book) {
          if (err) return res.status(500).send(err);

          if (book) {
            return res.status(289).send(JSON.stringify(book._meta));
          }

          //res.status(204).send("No Book found, continue...");
          console.log('No book found, continue...');
          //No book found for Barcode, try to find book info
          //from isbn resolver
          isbn.resolve(req.body.isbn, function (err, book) {
            if (err) {
              return res.status(500).send();
            }
            if (book.title) {
              //console.log(JSON.stringify(book.title));
              //Return book title if successful (200)
              return res.status(200).send(JSON.stringify(book.title));
            }
            return res.status(489).send();
          });
        });
      } else { //Incorrect Password
        console.log('Incorrect password');
        return res.status(401).send();
      }
    });
  });
});

router.post('/getBookByISBN', function (req, res, next) {

  //Required parameters
  var required = ['schoolID', 'isbn', 'password'];
  required.forEach(function (param) {
    if (!req.body[param]) {
      return res.status(400).send();
    }
  });

  var criteria = { schoolID: req.body.schoolID };
  var password = req.body.password

  School.findOne(criteria, function (err, school) {
    if (err) {
      return res.status(500).send();
    }

    if (!school) {
      console.log('School ' + req.body.schoolID + ' DNE');
      return res.status(401).send();
    }

    school.comparePassword(password, function (err, isMatch) {
      if (isMatch && isMatch == true) {
        //Correct password resolve book by isbn
        isbn.resolve(req.body.isbn, function (err, book) {
          if (err) {
            return res.status(500).send();
          }
          if (book.title) {
            //console.log(JSON.stringify(book.title));
            //Return book title if successful (200)
            return res.status(200).send(JSON.stringify(book.title));
          }
          return res.status(489).send();
        });
      } else { //Incorrect Password
        console.log('Incorrect password');
        return res.status(401).send();
      }
    });
  });
});


router.post('/books', function (req, res, next) {

  //Required parameters
  var required = ['schoolID', 'isbn', 'barcode', 'password']
  var required_browser = ['schoolID', 'isbn', 'barcode']
  if (req.session.user.admin == true) {
    required_browser.forEach(function (param) {
      if (!req.body[param]) {
        return res.status(400).send();
      }
    });

    isbn.resolve(req.body.isbn, function (err, book) {
      if (err) {
        logger.warn('Not able to resolve %s', req.body.isbn, err);
        //ISBN not resolved, handle in front end
        return res.status(269).send();
        //return next(err);
      }

      var criteria = { schoolID: req.body.schoolID };
      var password = req.body.password

      School.findOne(criteria, function (err, school) {
        if (err) {
          return res.status(500).send();
        }

        if (!school) {
          console.log('School ' + req.body.schoolID + ' DNE');
          return res.status(401).send();
        }

        var barcode = req.body.barcode;
        var barcodelength = 9;

        //Fill 0's
        if (barcode.length < barcodelength) {
          barcode = new Array(barcodelength - barcode.length).join('0') + barcode;
        } else if (barcode.length > barcodelength) {
          return res.status(400).send("Bad Barcode");
        }

        // complete book with custom fields
        book._meta = {};
        book._meta.isbn = req.body.isbn;
        book._meta.barcode = barcode;
        book._meta.ddc = req.body.ddc;
        book._meta.donor_email = req.body.donor_email;
        book._meta.creationDate = new Date();
        book._meta.available = true;
        book._meta.schoolID = req.body.schoolID;



        books.insert(book, function (err, result) {
          if (err) {
            console.log(err);
            if (err.code == 11000) {
              //duplicate key, conflicting data
              return res.status(409).send();
            }
            return res.status(500).send();
          }

          //Success: returns 204 No Content
          if (result) {
            return res.status(204).send();
          }
          // redirect after post pattern
          return res.redirect('/admin/bookRegistrationPage');
        });
      });
    });


  } else {
    required.forEach(function (param) {
      if (!req.body[param]) {
        return res.status(400).send();
      }
    });

    isbn.resolve(req.body.isbn, function (err, book) {
      if (err) {
        logger.warn('Not able to resolve %s', req.body.isbn, err);
        //ISBN not resolved, handle in front end
        return res.status(269).send();
        //return next(err);
      }

      var criteria = { schoolID: req.body.schoolID };
      var password = req.body.password

      School.findOne(criteria, function (err, school) {
        if (err) {
          return res.status(500).send();
        }

        if (!school) {
          console.log('School ' + req.body.schoolID + ' DNE');
          return res.status(401).send();
        }

        school.comparePassword(password, function (err, isMatch) {
          if (err) {
            return res.status(500).send("Password verification error");
          }
          if (isMatch && isMatch == true) {
            //password verified allow insert....

            // TODO check whether the barcode (req.body.barcode) 
            // already exists
            // handle error instead of throwing

            //Sanitize barcode
            var barcode = req.body.barcode;
            var barcodelength = 9;

            //Fill 0's
            if (barcode.length < barcodelength) {
              barcode = new Array(barcodelength - barcode.length).join('0') + barcode;
            } else if (barcode.length > barcodelength) {
              return res.status(400).send("Bad Barcode");
            }

            // complete book with custom fields
            book._meta = {};
            book._meta.isbn = req.body.isbn;
            book._meta.barcode = barcode;
            book._meta.ddc = req.body.ddc;
            book._meta.donor_email = req.body.donor_email;
            book._meta.creationDate = new Date();
            book._meta.available = true;
            book._meta.schoolID = req.body.schoolID;



            books.insert(book, function (err, result) {
              if (err) {
                console.log(err);
                if (err.code == 11000) {
                  //duplicate key, conflicting data
                  return res.status(409).send();
                }
                return res.status(500).send();
              }

              //Success: returns 204 No Content
              if (result) {
                return res.status(204).send();
              }
              // redirect after post pattern
              return res.redirect('/admin');
            });

          } else { //Incorrect Password
            console.log('Incorrect password');
            return res.status(401).send();
          }
        });
      });
    });
  }
});

// router.delete('/books/:id', function(req, res, next) {
//     books.remove(req.params.id, function(err, result) {
//         if (err) {
//             return next(err);
//         }

//         if (req.is('json')) {
//             return res.json(result);
//         }

//         return res.redirect('/admin');
//     });
// });

module.exports = router;
