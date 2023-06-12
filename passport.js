const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcryptjs");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const axios = require('axios');


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
      clientID: "1923853964664020",
      clientSecret: "0872c753e1cf2585307123f132488200",
      callbackURL: "https://beebuddies.up.railway.app/auth/login-facebook/callback",
      profileFields: ['id', 'emails', 'name', 'picture.type(large)', 'birthday'],
    },
    async function(accessToken, refreshToken, profile, done) {
      console.log("STAGE 1.5 FACEBOOK LOGIN");
      try {
        console.log(profile);

        const existingUser = await User.findOne({ facebookId: profile.id });
        if (existingUser) {
          // They have an account in my app, return that user.
          return done(null, existingUser);
        }

        async function getImageDataFromUrl(imageUrl) {
          try {
            const response = await axios.get(imageUrl, {
              responseType: 'arraybuffer',
            });
            const contentType = response.headers['content-type'];
            const imageBuffer = Buffer.from(response.data, 'binary');
            const base64Image = imageBuffer.toString('base64');
            return {
              base64Image,
              contentType,
            };
          } catch (error) {
            console.error('Error retrieving image:', error);
            throw error;
          }
        }

        if (!profile.photos || !profile.photos.length) {
          // Create user without profile picture
          const newUser = new User({
            facebookId: profile.id,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            email: `facebook-user-email-${profile.id}`,
            password: `facebook-user-password-${profile.id}`,
            birthdate: profile.birthday ? new Date(profile.birthday) : new Date('1900-01-01'),

            // User Friends
            friends: [],
            friend_requests_in: [],
            friend_requests_out: [],

            // User Content
            posts: [],
            liked_posts: [],
            liked_comments: [],
          });

          const savedUser = await newUser.save();
          return done(null, savedUser);
        } else {
          const imageUrl = profile.photos[0].value;
          const largerImageUrl = imageUrl.replace(/width=\d+&height=\d+/i, 'width=200&height=200');
          const imageData = await getImageDataFromUrl(largerImageUrl);
          console.log('Base64 Image:', imageData.base64Image);
          console.log('Content Type:', imageData.contentType);

          const newUser = new User({
            facebookId: profile.id,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            email: `facebook-user-email-${profile.id}`,
            password: `facebook-user-password-${profile.id}`,
            birthdate: profile.birthday ? new Date(profile.birthday) : new Date('1900-01-01'),
            profile_picture: {
              data: Buffer.from(imageData.base64Image, 'base64'),
              contentType: imageData.contentType,
            },
            // User Friends
            friends: [],
            friend_requests_in: [],
            friend_requests_out: [],

            // User Content
            posts: [],
            liked_posts: [],
            liked_comments: [],
          });

          const savedUser = await newUser.save();
          return done(null, savedUser);
        }
      } catch (error) {
        return done(error);
      }
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