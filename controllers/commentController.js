const { body, validationResult } = require("express-validator");
const async = require("async");

// Models
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Create a comment
exports.post_comment = [
    body("comment", "Must be at least one digit long").trim().isLength({min: 1}),
    async (req, res, next) =>  {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const comment = new Comment({
            author: req.params.id,
            content: req.body.comment,
            likes: [],
        })

        const savedComment = await comment.save();

        const post = await Post.findById(req.params.postId);
            post.comments.push(savedComment._id);
            await post.save();
            res.json({ message: `Sucessfully commented on post: ${post._id}` });
    },
];

// Delete a comment
exports.delete_comment = (req, res, next) => {
    res.json({message: "delete a comment"});
};

// Like a commment
exports.like_comment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.likes.includes(req.params.id)) {
            comment.likes.pull(req.params.id);
            await comment.save();
            res.json({message: `${req.params.id} successfully unliked comment ${req.params.commentId}`});
        } else {
            comment.likes.push(req.params.id);
            await comment.save();
            res.json({message: `${req.params.id} successfully liked comment ${req.params.commentId}`});
        }
    } catch (err) {
        res.status(500).json({ error: "There was an error liking the comment"});
    }
};
