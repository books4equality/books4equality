var express = require('express'),
  router = express.Router(),
  schools = require('../services/schools'),
  User = require('../lib/models/user'),
  getAllStats = require('../services/stats/schoolStats').getAllStats

var isAdmin = require('../services/helpers/isAdmin').isAdmin

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

router.get('/editAdmins', (req, res) => {
  if(!isAdmin(req)) return res.status(401).send(notAuthorizedMessage)
  if(req.session.user.superUser === true) {
    User.find({}, (err, users) => {
      if(err) return res.status(500).send()
      return res.render('admin/editAdmins', {
        'page_name': 'editAdmins',
        users,
        'schoolID': 'ALL SCHOOLS'
      })
    })
  } else {
    schools.getSchoolUsers(req.session.user.schoolID, (err, users) => {
      if(err) return res.status(500).send('Database Failure')
      return res.render('admin/editAdmins', {
        'page_name': 'editAdmins',
        users,
        'schoolID': req.session.user.schoolID
      })
    })
  }
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

router.get('/bookStatsPage', (req, res) => {
  if(!isAdmin(req)) return res.status(401).send(notAuthorizedMessage)
  getAllStats(req.session.user.schoolID, (err, stats) => {
    if(err) return res.status(500).send('Server Error')
    return res.render('admin/bookStatsPage', {
      'page_name': 'bookStats',
      'schoolStats': stats,
      'schoolID': req.session.user.schoolID
    })
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
