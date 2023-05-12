const { body, validationResult } = require("express-validator");
const async = require("async");

// Models
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Get all posts belonging to a specific user and their friends, aka their newsfeed
exports.get_user_and_friend_posts = (req, res, next) => {
    res.json({message: "get user and friend posts"});
};

// Get all posts belonging to a specific user
exports.get_user_posts = (req, res, next) => {
    res.json({message: "get user posts"});
};

// Create a post
exports.post_post = [
    (req, res, next) => {
        res.json({message: "create a post"});
    }
];

// Delete a post
exports.delete_post = (req, res, next) => {
    res.json({message: "delete a post"});
};

// Like a post
exports.like_post = (req, res, next) => {
    res.json({message: "like a post"});
};

// Unlike a post
exports.unlike_post = (req, res, next) => {
    res.json({message: "unlike a post"});
};
