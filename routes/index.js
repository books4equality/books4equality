'use strict'
var express = require('express'),
  schools = require('../services/schools'),
  router = express.Router()

router.get('/', function (req, res) {
  res.render('index',
    { 'page_name': 'index' }
  )
})

router.get('/contact', function (req, res) {
  res.render('contact',
    { 'page_name': 'contact' }
  )
})

router.get('/library', function (req, res) {
  schools.getSchoolIDs((error, schools) => {
    if (error) return res.status(500).send()
    return res.render('library',
      {
        'page_name': 'library',
        'schoolID': req.session.user ? req.session.user.schoolID : null,
        'schools': schools
      }
    )
  })
})

router.get('/mission', function (req, res) {
  res.render('mission',
    { 'page_name': 'mission' }
  )
})

router.get('/schedule', function (req, res) {
  res.render('schedule',
    { 'page_name': 'schedule' }
  )
})

router.get('/about_us', function (req, res) {
  res.render('about_us',
    { 'page_name': 'about_us' }
  )
})

router.get('/users', function (req, res) {
  schools.getSchoolIDs((error, schools) => {
    if (error) return res.status(500).send()
    return res.render('userViews/login',
      {
        'page_name': 'sign_up',
        'schools': schools
      }
    )
  })
})

module.exports = router
