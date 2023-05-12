const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const User = require("./models/user");

// Passport Local Strategy
passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      (email, password, done) => {
        try {
            console.log("ALERT: PASSPORT LOCAL CALLED");
            User.findOne({ email }, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                  return done(null, false, { message: 'Incorrect email.' });
                }
                if (!user.validPassword(password)) {
                  return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
              });
        } catch(err) {
            return done(err);
        };

      }
    )
);

// Functions 2 and 3, 
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

// Passport Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.fbappid,
      clientSecret: process.env.fbsecret,
      callbackURL: "http://localhost:4000/auth/login-facebook/callback",
      profileFields: ['id', 'emails', 'name'],
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOrCreate({ facebookId: profile.id }, function(err, user) {
        return done(err, user);
      });
    }
  )
);

module.exports = passport;