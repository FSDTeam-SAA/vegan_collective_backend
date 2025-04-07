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
    failureRedirect: '/auth/google/failure',
  }),
  (req, res) => {
    res.redirect('/api/v1/protected') // Redirect to protected route after login
  }
)

route.get('/protected', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  res.json({ message: `Hello ${req.user.fullName}`, user: req.user })
})


route.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..')
})

route.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' })

    req.session.destroy(() => {
      res.send('Logged out successfully')
    })
  })
})


module.exports = route
