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
          cb(new Error('Invalid file type.'));
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
    let query = {};

    if (req.query.guestMode === 'true') {
      // If guestMode is true, fetch all posts
      query = {}; // Empty query to fetch all posts
    } else {
      // Fetch posts for the user and their friends
      const user = await User.findById(req.params.id)
        .select('friends')
        .populate('friends');

      if (!user) {
        return res.status(404).json({ error: 'No user found' });
      }

      const friends = [req.params.id, ...user.friends.map((friend) => friend._id)];
      query = { author: { $in: friends } };
    }

    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 posts per page

    const options = {
      sort: { timestamp: -1 },
      skip: (page - 1) * limit,
      limit: +limit, // Convert limit to a number
    };

    const allPosts = await Post.find(query)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit)
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'author',
            select: 'first_name last_name profile_picture',
          },
          {
            path: 'likes',
            select: 'first_name last_name',
          },
        ],
      })
      .populate({
        path: 'author',
        select: 'first_name last_name profile_picture',
      })
      .populate({
        path: 'likes',
        select: 'first_name last_name',
      })
      .lean();

    res.json(allPosts);
  } catch (err) {
    res.status(500).json({ error: 'An error has occurred' });
  }
};


// Get all posts belonging to a specific user
exports.get_user_posts = (req, res, next) => {
    res.json({message: "get user posts"});
};

// Create a post - COMPLETE
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
body("content", "Post has no content").trim().isLength({min: 1}),
body("author", "Post has no author").trim().isLength({min: 1}),
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
exports.delete_post = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.id;

    // Find the post's comments and delete each comment individually
    const post = await Post.findById(postId);
    const commentIds = post.comments;

    // Delete each comment individually
    for (const commentId of commentIds) {
      await Comment.findByIdAndDelete(commentId);
    }

    // Delete the post from the Post model
    await Post.findByIdAndDelete(postId);

    // Remove the post reference from the author's posts array
    await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the post' });
  }
};

// Like a post - COMPLETE
exports.like_post = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId)
        .select("likes");

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.likes.includes(req.params.id)) {
            post.likes.pull(req.params.id);
            await post.save();
            res.json({message: `${req.params.id} successfully unliked post ${req.params.postId}`});
        } else {
            post.likes.push(req.params.id);
            await post.save();
            res.json({message: `${req.params.id} successfully liked post ${req.params.postId}`});
        }
    } catch (err) {
        res.status(500).json({ error: "There was an error liking the post"});
    }
};

