const { body, validationResult } = require("express-validator");
const async = require("async");
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Models
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

exports.login = (req, res, next) => {
    console.log("PASSPORT - LOCAL - LOGIN ROUTE")
    passport.authenticate("local", {session: false}, function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Success through passport-local
        req.login(user, {session: false}, function(err) {
            console.log("STAGE + 1 - req.login")
            // console.log(user);
            if (err) {
                return next(err);
            }
            const token = jwt.sign({userId: user._id}, process.env.secretjwt);
            return res.status(200).json({user, token});
        });
    })(req, res, next);
};

exports.login_facebook = (req, res, next) => {
    passport.authenticate('facebook')(req, res, next)
};

exports.login_facebook_callback = (req, res, next) => {
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      const token = jwt.sign({ userId: req.user._id }, process.env.secretjwt);
      res.redirect('/home?token=' + token);
    }
}