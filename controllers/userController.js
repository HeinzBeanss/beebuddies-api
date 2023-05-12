const { body, validationResult } = require("express-validator");
const async = require("async");

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
    (req, res, next) =>  {
        res.json({ message: "post user"});

    }
];

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


    



