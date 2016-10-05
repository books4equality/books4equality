var express = require('express'),
  router = express.Router()

var notAuthorizedMessage =
  'Are you daft? Unauthorized.\n' +
  'Please sign into an administrative account.'

router.get('/', function (req, res) {
  if (typeof req.session.user == 'undefined') {
    return res.status(401).send(notAuthorizedMessage)
  }
  if (typeof req.session.user.admin == 'undefined' ||
    req.session.user.admin == false) {
    return res.status(401).send(notAuthorizedMessage)
  }

  return res.render('admin/index')
})

router.get('/bookRegistrationPage', (req, res) => {
  if (typeof req.session.user == 'undefined') {
    return res.status(401).send(notAuthorizedMessage)
  }
  if (typeof req.session.user.admin == 'undefined' ||
    req.session.user.admin == false) {
    return res.status(401).send(notAuthorizedMessage)
  }
  return res.render('admin/bookRegistration', {
    'page_name': 'bookRegistration',
    'schoolID': req.session.user.schoolID
  })
})

router.get('/bookRegistrationPageManual', (req, res) => {
  if (typeof req.session.user == 'undefined') {
    return res.status(401).send(notAuthorizedMessage)
  }
  if (typeof req.session.user.admin == 'undefined' ||
    req.session.user.admin == false) {
    return res.status(401).send(notAuthorizedMessage)
  }
  return res.render('admin/bookRegistrationManual', {
    'page_name': 'bookRegistrationManual',
    'schoolID': req.session.user.schoolID
  })
})

module.exports = router
