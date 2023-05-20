const { body, validationResult } = require("express-validator");
const async = require("async");

// Models
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Get all posts belonging to a specific user and their friends, aka their newsfeed - COMPLETE
exports.get_user_and_friend_posts = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        .select("friends")
        .populate("friends");

        if (!user) {
            return res.status(404).json({ error: "No user found"})
        }
        const friends = [req.params.id, ...user.friends.map(friend => friend._id)];
        const allPosts = await Post.find({ author: { $in: friends } }).sort({ timestamp: -1 });
        
        res.json(allPosts);
    } catch (err) {
        res.status(500).json({error: "An error has occured"});
    }
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
