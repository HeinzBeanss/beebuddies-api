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
            if (err) {
                return next(err);
            }
            const token = jwt.sign({userId: user._id},  process.env.secretjwt, { expiresIn: "1h" });
            const updatedUser = user.toObject();
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

exports.logout = (req, res, next) => {
    console.log("LOGGING USER OUT");
    req.logout();
    return res.status(200).json({message: "User has been logged out"});
};

exports.verify_token = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.secretjwt);
        const user = await User.findById(decoded.userId)
        .select("first_name last_name _id profile_picture");
        if (!user) {
            return res.status(404).json({ message:"User not found" });
        }
        // Convert the "user" (mongoose document) to a JavaScript object
        const updatedUser = user.toObject();
        return res.status(200).json({ updatedUser, token });
    }   catch (error) {
        res.status(401).json({ message:"Invalid Token" });
    }
};