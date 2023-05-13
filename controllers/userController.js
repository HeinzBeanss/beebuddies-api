const { body, validationResult } = require("express-validator");
const async = require("async");
const bcrypt = require("bcryptjs");


// Models
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Get all Users and their respective Posts and Comments
exports.get_user_list = (req, res, next) => {
    res.json({ message: "user list"});
};

// Get specific User
exports.get_user = (req, res, next) => {
    res.json({ message: "user detail"});
};

// Create new user
exports.post_user = [
    body("first_name", "You must enter your first name").trim().notEmpty().escape(),
    body("last_name", "You must enter your last name").trim().notEmpty().escape(),
    body("email", "Invalid email address").trim().notEmpty().isEmail().escape(),
    body("password", "Must be 6 at least characters").trim().isLength({min: 6}).escape(),
    body("passwordtwo").custom((value, {req}) => {
        if (value !== req.body.password) {
            console.log(value);
            console.log(req.body.password);
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    async (req, res, next) =>  {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        // Make sure to hash the password e.g bycrypt.hash
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            if (err) {
                return next(err)
            }
            // Store hashedPassword in DB
            try {
                console.log("GENERATING USER")
                const user = new User({
                    // User Details
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    password: hashedPassword,
                    
                    // User Friends
                    friends: [],
                    friend_requests_in: [],
                    friend_requests_out: [],

                    // User Content
                    posts: [],
                    liked_posts: [],
                    liked_comments: [],
                });

                const result = await user.save();
                return res.json({ message: result });

            } catch(err) {
                return next(err);
            };
        });
    }
]

// Edit a user profile
exports.edit_user = [
    (req, res, next) => {
        res.json({ message: "edit user"});
    }
];

// Send a friend request
exports.send_friend_request = (req, res, next) => {
    res.json({ message: "send friend request"});
};

// Accept a friend request
exports.add_friend = (req, res, next) => {
    res.json({ message: "accept friend request"});
};

// Resind a friend reqest
exports.resind_friend_request = (req, res, next) => {
    res.json({ message: "resind friend request"}); 
};

// Deny a friend request
exports.deny_friend_request = (req, res, next) => {
    res.json({ message: "deny friend request"});
};

// Remove a friend
exports.remove_friend = (req, res, next) => {
    res.json({ message: "remove friend"});
};

// Delete user
exports.delete_user = (req, res, next) => {
    res.json({ message: "delete user"});
};


    



