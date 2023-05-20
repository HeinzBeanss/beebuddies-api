const express = require("express");
const router = express.Router();

// Controllers
const user_controller = require("../controllers/userController");
const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");

// USER ROUTES
// Get all Users and their respective Posts and Comments
router.get("/users", user_controller.get_user_list);

// Get specific User
router.get("/users/:id", user_controller.get_user);

// Create new user
router.post("/users", user_controller.post_user);

// Edit a user profile
router.put("/users/:id", user_controller.edit_user);

// Get a list of friends
router.get("/users/:id/friends", user_controller.get_friends);

// Get a list of friend requests
router.get("/users/:id/friend-requests", user_controller.get_friend_requests);

// Send a friend request
router.put("/users/:id/send-friend-request/:targetUserId", user_controller.send_friend_request);

// Accept a friend request
router.put("/users/:id/add-friend/:targetUserId", user_controller.add_friend);

// Resind a friend request
router.put("/users/:id/resind-friend-request/:targetUserId", user_controller.resind_friend_request);

// Deny a friend request
router.put("/users/:id/deny-friend-request/:targetUserId", user_controller.deny_friend_request);

// Remove a friend
router.put("/users/:id/remove-friend/:targetUserId", user_controller.remove_friend);

// Delete a user
router.delete("/users/:id", user_controller.delete_user);





// POST ROUTES

// Get all posts belonging to a specific user and their friends, aka their newsfeed
router.get("/users/:id/friends/posts", post_controller.get_user_and_friend_posts);

// Get all posts belonging to a specific user
router.get("/users/:id/posts", post_controller.get_user_posts);

// Create a post
router.post("/users/:id/posts", post_controller.post_post);

// Delete a post
router.delete("/users/:id/posts/:postId", post_controller.delete_post);

// Like a post
router.put("/users/:id/posts/:postId/like", post_controller.like_post);

// Unlike a post
router.put("/users/:id/posts/:postId/unlike", post_controller.unlike_post);



// COMMENT ROUTES
// Create a comment
router.post("/comments", comment_controller.post_comment);

// Delete a comment
router.delete("/comments/:commentId", comment_controller.delete_comment);

// Like a comment
router.put("/comments/:commentId/like", comment_controller.like_comment);

// Unlike a comment
router.put("/comments/:commentId/unlike", comment_controller.unlike_comment);

// Export
module.exports = router;