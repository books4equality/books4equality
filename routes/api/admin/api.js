'use strict'

/**
 * admin.js contains all of the book related routes that require
 * an admin account to access
 *
 *
 */

var express = require('express'),
  isbn = require('node-isbn'),
  bodyParser = require('body-parser'),
  books = require('../../../services/books'),
  logger = require('../../../services/logger'),
  School = require('../../../lib/models/school'),
  router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json({ limit: '10kb' }))

router.get('/reservedBooks', function (req, res) {
  var options = req.query
  options.schoolID = req.session.user.schoolID
  
  if(!req.session.user.admin) return res.status(401).send()

  books.findReservedBooks(options, function (err, books) {
    if (err) { return res.status(500).send() }

    return res.status(200).send(books)
  })
})


//TODO: Clean up with async
router.post('/getBookInfo', function (req, res) {

  //Required parameters
  var required = ['schoolID', 'barcode', 'isbn', 'password']
  required.forEach(function (param) {
    if (!req.body[param]) {
      return res.status(400).send()
    }
  })

  var criteria = { schoolID: req.body.schoolID }
  var password = req.body.password

  School.findOne(criteria, function (err, school) {
    if (err) {
      return res.status(500).send()
    }

    if (!school) {
      console.log('School ' + req.body.schoolID + ' DNE')
      return res.status(401).send()
    }

    school.comparePassword(password, function (err, isMatch) {
      if (isMatch && isMatch == true) {
        //TODO: Add a barcode check, gets isbn and dewey code and returns them to the app
        books.findSchoolBookByBarcode(req.body.schoolID, req.body.barcode, function (err, book) {
          if (err) return res.status(500).send(err)

          if (book) {
            return res.status(289).send(JSON.stringify(book._meta))
          }

          //res.status(204).send("No Book found, continue...");
          console.log('No book found, continue...')
          //No book found for Barcode, try to find book info
          //from isbn resolver
          isbn.resolve(req.body.isbn, function (err, book) {
            if (err) {
              return res.status(500).send()
            }
            if (book.title) {
              //console.log(JSON.stringify(book.title));
              //Return book title if successful (200)
              return res.status(200).send(JSON.stringify(book.title))
            }
            return res.status(489).send()
          })
        })
      } else { //Incorrect Password
        console.log('Incorrect password')
        return res.status(401).send()
      }
    })
  })
})

router.post('/getBookByISBN', function (req, res) {

  //Required parameters
  var required = ['schoolID', 'isbn', 'password']
  required.forEach(function (param) {
    if (!req.body[param]) {
      return res.status(400).send()
    }
  })

  var criteria = { schoolID: req.body.schoolID }
  var password = req.body.password

  School.findOne(criteria, function (err, school) {
    if (err) {
      return res.status(500).send()
    }

    if (!school) {
      console.log('School ' + req.body.schoolID + ' DNE')
      return res.status(401).send()
    }

    school.comparePassword(password, function (err, isMatch) {
      if (isMatch && isMatch == true) {
        //Correct password resolve book by isbn
        isbn.resolve(req.body.isbn, function (err, book) {
          if (err) {
            return res.status(500).send()
          }
          if (book.title) {
            //console.log(JSON.stringify(book.title));
            //Return book title if successful (200)
            return res.status(200).send(JSON.stringify(book.title))
          }
          return res.status(489).send()
        })
      } else { //Incorrect Password
        console.log('Incorrect password')
        return res.status(401).send()
      }
    })
  })
})


router.post('/books', function (req, res) {
  if (req.session.user.admin == true) {
    completeEntryBrowser(req, res)
  } else {
    completeEntryApp(req, res)
  }
})

router.post('/booksManualEntry', function(req, res) {
  if(req.session.user.admin !== true) return res.status(401).send()
  var required = ['title','authors','barcode','isbn','ddc','schoolID', 'donor_email', 'edition']
  var book = {}
  required.forEach(function(param) {
    if(!req.body[param]) {
      return res.status(400).send('Missing parameter ' + param)
    }
  })

  var barcode = sanitizeBarcode(req.body.barcode)
  if(!barcode) return res.status(400).send('Bad barcode (too long?)')

  //Book Data
  book.title = req.body.title
  book.authors = req.body.authors
  book.edition = req.body.edition
  //Meta
  book._meta = {}
  book._meta.isbn = req.body.isbn
  book._meta.barcode = barcode
  book._meta.ddc = req.body.ddc
  book._meta.donor_email = req.body.donor_email
  book._meta.creationDate = new Date()
  book._meta.available = true
  book._meta.schoolID = req.body.schoolID

  books.insert(book, function (err, result) {
    if (err) {
      console.log(err)
      if (err.code == 11000) {
        //duplicate key, conflicting data
        return res.status(409).send()
      }
      return res.status(500).send()
    }
    //Success: returns 204 No Content
    console.log(result)
    return res.status(204).send()
  })
})

module.exports = router


function completeEntryApp(req, res) {
  var required = ['schoolID', 'isbn', 'barcode', 'password']
  required.forEach(function (param) {
    if (!req.body[param]) {
      return res.status(400).send()
    }
  })

  isbn.resolve(req.body.isbn, function (err, book) {
    if (err) {
      logger.warn('Not able to resolve %s', req.body.isbn, err)
      //ISBN not resolved, handle in front end
      return res.status(269).send()
      //return next(err);
    }

    var criteria = { schoolID: req.body.schoolID }
    var password = req.body.password

    School.findOne(criteria, function (err, school) {
      if (err) {
        return res.status(500).send()
      }

      if (!school) {
        console.log('School ' + req.body.schoolID + ' DNE')
        return res.status(401).send()
      }

      school.comparePassword(password, function (err, isMatch) {
        if (err) {
          return res.status(500).send('Password verification error')
        }
        if (isMatch && isMatch == true) {
          //password verified allow insert....

          // TODO check whether the barcode (req.body.barcode)
          // already exists
          // handle error instead of throwing

          var barcode = sanitizeBarcode(req.body.barcode)
          if(!barcode) return res.status(400).send('bad barcode')

          // complete book with custom fields
          book._meta = {}
          book._meta.isbn = req.body.isbn
          book._meta.barcode = barcode
          book._meta.ddc = req.body.ddc
          book._meta.donor_email = req.body.donor_email
          book._meta.creationDate = new Date()
          book._meta.available = true
          book._meta.schoolID = req.body.schoolID



          books.insert(book, function (err, result) {
            if (err) {
              console.log(err)
              if (err.code == 11000) {
                //duplicate key, conflicting data
                return res.status(409).send()
              }
              return res.status(500).send()
            }

            //Success: returns 204 No Content
            if (result) {
              return res.status(204).send()
            }
            // redirect after post pattern
            return res.redirect('/admin')
          })

        } else { //Incorrect Password
          console.log('Incorrect password')
          return res.status(401).send()
        }
      })
    })
  })
}

function completeEntryBrowser(req, res) {
  var required_browser = ['schoolID', 'isbn', 'barcode']
  required_browser.forEach(function (param) {
    if (!req.body[param]) {
      return res.status(400).send()
    }
  })

  isbn.resolve(req.body.isbn, function (err, book) {
    if (err) {
      logger.warn('Not able to resolve %s', req.body.isbn, err)
      //ISBN not resolved, handle in front end
      return res.status(269).send()
      //return next(err);
    }

    var criteria = { schoolID: req.body.schoolID }
    // var password = req.body.password

    School.findOne(criteria, function (err, school) {
      if (err) {
        return res.status(500).send()
      }

      if (!school) {
        console.log('School ' + req.body.schoolID + ' DNE')
        return res.status(401).send()
      }

      var barcode = sanitizeBarcode(req.body.barcode)
      if(!barcode) return res.status(400).send('bad barcode')
      // complete book with custom fields
      book._meta = {}
      book._meta.isbn = req.body.isbn
      book._meta.barcode = barcode
      book._meta.ddc = req.body.ddc
      book._meta.donor_email = req.body.donor_email
      book._meta.creationDate = new Date()
      book._meta.available = true
      book._meta.schoolID = req.body.schoolID



      books.insert(book, function (err, result) {
        if (err) {
          console.log(err)
          if (err.code == 11000) {
            //duplicate key, conflicting data
            return res.status(409).send()
          }
          return res.status(500).send()
        }

        //Success: returns 204 No Content
        if (result) {
          return res.status(204).send()
        }
        // redirect after post pattern
        return res.redirect('/admin/bookRegistrationPage')
      })
    })
  })
}

function sanitizeBarcode(barcode) {
  //Sanitize barcode
  var barcodelength = 9
  //Fill 0's
  if (barcode.length < barcodelength) {
    return new Array(barcodelength - barcode.length).join('0') + barcode
  } else if (barcode.length > barcodelength) {
    return false
  }
}
