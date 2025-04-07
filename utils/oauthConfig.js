const User = require('../models/user.model') // Import the User model
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8001/api/v1/auth/google/callback',
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value })

        if (!user) {
          // Create new user
          user = new User({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
            role: 'user',
            verifyEmail: true,
          })

          await user.save()
        }

        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)


passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})


// const passport = require('passport')
// const GoogleStrategy = require('passport-google-oauth2').Strategy

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: 'http://localhost:8001/api/v1/auth/google/callback',
//       passReqToCallback: true,
//     },
//     function (request, accessToken, refreshToken, profile, done) {
//       return done(null, profile)
//     }
//   )
// )

// passport.serializeUser(function (user, done) {
//   done(null, user)
// })

// passport.deserializeUser(function (user, done) {
//   done(null, user)
// })
