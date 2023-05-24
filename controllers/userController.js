const { body, validationResult } = require("express-validator");
const async = require("async");
const bcrypt = require("bcryptjs");
const { DateTime } = require('luxon');

// Models
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Get all Users that aren't friends with he current user - COMPLETE
exports.get_user_list_not_friends = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.id)
        .populate("friends");
        const friendList = currentUser.friends.map(friend => friend._id);

        const users = await User.find({
            $and: [
                { _id: { $nin: [req.params.id, ...friendList] } },
            ]
        })
        .select("first_name last_name profile_picture friends friend_requests_in friend_requests_out _id")
        .lean();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred' });
    }
};

// Get specific User
exports.get_user = async (req, res, next) => {
    try {   
        const user = await User.findById(req.params.id)
        .lean();
        // Note - Maybe populate fields.
        res.json(user)
    } catch (err) {
        res.status(500).json({ error: "An error has occured" });
    }
};

// Create new user - COMPLETE
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
    body("birthdate", "You must enter your birthdate").notEmpty(),
    body("birthdate", "Invalid date of birth")
    .isISO8601()
    .toDate(),
    async (req, res, next) =>  {
        console.log(req.body.birthdate);
        if (req.body.birthdate instanceof Date) {
            console.log('birthdate is a Date object');
        }
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
                    birthdate: req.body.birthdate,

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

// Get a list of friends - COMPLETE
exports.get_friends = async (req, res,  next) => {
    try {
        const user = await User.findById(req.params.id)
        .select("friends")
        .populate("friends")
        .lean();

        if (!user) {
            return res.status(404).json({ error: "No user found"})
        } 
        res.json(user.friends);
    } catch (err) {
        res.status(500).json({ error: "An error has occured" });
    }
}

// Get a list of friend requests  - COMPLETE
exports.get_friend_requests = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        .select("friend_requests_in")
        .populate({
            path: "friend_requests_in",
            select: "first_name last_name profile_picture"
        })
        .lean();

        if (!user) {
            return res.status(404).json({ error: "No user found"});
        }
        res.json(user.friend_requests_in);
    } catch (err) {
        res.status(500).json({ error: "An error occured" });
    }
}

// Send a friend request - COMPLETE
exports.send_friend_request = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.id);
        const targetUser = await User.findById(req.params.targetUserId);
    
        const isFriend = currentUser.friends.includes(req.params.targetUserId);
        const isRequestSent = currentUser.friend_requests_out.includes(req.params.targetUserId);
    
        if (isFriend || isRequestSent) {
            return res.status(400).json({ error: "Friend request already sent or user is already a friend" });
        }
        
        currentUser.friend_requests_out.push(req.params.targetUserId);
        targetUser.friend_requests_in.push(req.params.id);
    
        await Promise.all([ currentUser.save(), targetUser.save()]);

        res.json({ message: `Sucessfully ${currentUser.first_name} added ${targetUser.first_name}` });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "An error occurred while sending the friend request" });
    }
};

// Accept a friend request - COMPLETE
exports.add_friend = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.id)
        .populate("friend_requests_in friends");
        const targetUser = await User.findById(req.params.targetUserId)
        .populate("friend_requests_out friends");

        currentUser.friend_requests_in.pull(targetUser._id);
        targetUser.friend_requests_out.pull(currentUser._id);
        currentUser.friends.push(targetUser._id);
        targetUser.friends.push(currentUser._id);

        await Promise.all([ currentUser.save(), targetUser.save()]);

        res.json({ message: ` ${currentUser.first_name} accepted ${targetUser.first_name}'s friend request` });

    } catch (err) {
        res.status(500).json({ error: "An error has occured" });
    }
};

// Resind a friend reqest - COMPLETE
exports.resind_friend_request = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.id)
        .populate("friend_requests_out");
        const targetUser = await User.findById(req.params.targetUserId)
        .populate("friend_requests_in");

        currentUser.friend_requests_out.pull(targetUser._id);
        targetUser.friend_requests_in.pull(currentUser._id);

        await Promise.all([ currentUser.save(), targetUser.save()]);

        res.json({ message: ` ${currentUser.first_name} rescinded ${targetUser.first_name}'s friend request` });

    } catch (err) {
        res.status(500).json({ error: "An error has occured while attempting to rescind the friend request" });
    }
};

// Deny a friend request - COMPLETE
exports.deny_friend_request = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.id)
        .populate("friend_requests_in");
        const targetUser = await User.findById(req.params.targetUserId)
        .populate("friend_requests_out");

        currentUser.friend_requests_in.pull(targetUser._id);
        targetUser.friend_requests_out.pull(currentUser._id);

        await Promise.all([ currentUser.save(), targetUser.save()]);

        res.json({ message: ` ${currentUser.first_name} denied ${targetUser.first_name}'s friend request` });
    } catch (err) {
        res.status(500).json({ error: "An error occurred while denying the friend request" });
    }
};

// Remove a friend
exports.remove_friend = (req, res, next) => {
    res.json({ message: "remove friend"});
};

// Delete user
exports.delete_user = (req, res, next) => {
    res.json({ message: "delete user"});
};


