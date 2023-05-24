const { body, validationResult } = require("express-validator");
const async = require("async");
const multer = require("multer");
const upload = multer({
    limits: {
      fileSize: 2 * 1024 * 1024, // 1MB in bytes
    },
    fileFilter: function (req, file, cb) {
        // Check the file type
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/gif' || file.mimetype === 'image/tiff' || file.mimetype === 'image/webp' ) {
          // Accept the file
          cb(null, true);
        } else {
          // Reject the file
          cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
        }
      },
  });

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
        const allPosts = await Post.find({ author: { $in: friends } }).sort({ timestamp: -1 })
        .populate("author")
        .lean();
        
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
    upload.single('image')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds the limit of 2MB.' });
        }
        return res.status(500).json({ error: 'File upload error.' });
      } else if (err) {
        return res.status(500).json({ error: 'File upload error.' });
      }

      next();
    });
  },
body("content", "Post has no content").trim().isLength({min: 1}).escape(),
body("author", "Post has no author").trim().isLength({min: 1}).escape(),
async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.file === undefined) {
        // Upload post without an image
        try {
            const post = new Post({
                content: req.body.content,
                author: req.body.author,
                comments: [],
                likes: [],
            })
            const savedPost = await post.save();

            const user = await User.findById(req.body.author);
            user.posts.push(savedPost._id);
            await user.save();
            res.json({ message: 'Post created successfully with no image' });
        } catch (err) {
            return res.status(500).json({ message: "There was an error creating the post" });
        }
    } else {
        // Upload post with an image
        // Note - It's often better to send buffers in the database, then convert it clientside I think.
        try {
            const post = new Post({
                content: req.body.content,
                author: req.body.author,
                comments: [],
                likes: [],
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                }
            })
            const savedPost = await post.save();

            const user = await User.findById(req.body.author);
            user.posts.push(savedPost._id);
            await user.save();
            res.json({ message: 'Post created successfully with image' });
        } catch (err) {
            return res.status(500).json({ message: "There was an error creating the post" });
        }
    }
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
