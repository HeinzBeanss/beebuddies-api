const { body, validationResult } = require("express-validator");
const async = require("async");

// Models
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Create a comment
exports.post_comment = [
    (req, res, next) => {
        res.json({message: "post a comment"});
    }
];

// Delete a comment
exports.delete_comment = (req, res, next) => {
    res.json({message: "delete a comment"});
};

// Like a commment
exports.like_comment = (req, res, next) => {
    res.json({message: "like a comment"});
};

// Unlike a comment
exports.unlike_comment = (req, res, next) => {
    res.json({message: "unlike a comment"});
};