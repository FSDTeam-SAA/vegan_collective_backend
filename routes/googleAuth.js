const express = require('express')
const route = express.Router()
const session = require('express-session')
const passport = require('passport')
const isLoggedIn = require('../middleware/oauth.middleware')
require('../utils/oauthConfig')

route.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
)

route.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure',
  })
)

route.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`)
})

route.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..')
})

route.get('/logout', (req, res) => {
  req.logout()
  req.session.destroy()
  res.send('Goodbye!')
})

module.exports = route
