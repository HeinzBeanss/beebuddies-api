const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcryptjs");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;


const User = require("./models/user");

// Passport Local Strategy
passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      (email, password, done) => {
            console.log("ALERT: PASSPORT LOCAL CALLED");
            User.findOne({ email })
              .then((user) => {
              if (!user) {
                return done(null, false, { message: "Incorrect email or password" });
              }
    
              // Match password
              bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
    
                if (isMatch) {
                  console.log("ALERT: PASSWORDS MATCH, MOVING ON");
                  return done(null, user);
                } else {
                  return done(null, false, { message: "Incorrect email or password" });
                }
              });
            })
            .catch((err) => console.log(err));
            
          })
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

// Jwt Strategy
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey : process.env.secretjwt
},
function (jwtPayload, cb) {
  console.log("JWT STRAT");
  return UserModel.findOneById(jwtPayload.id)
      .then(user => {
          return cb(null, user);
      })
      .catch(err => {
          return cb(err);
      });
}
));

module.exports = passport;