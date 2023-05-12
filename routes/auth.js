const express = require("express");
const router = express.Router();

// Controllers
const auth_controller = require("../controllers/authController");

// LOGIN ROUTE
// Check user logs in and details are correct
router.post("/login", auth_controller.login);

// Check user logs in with facebook
router.get("/login-facebook", auth_controller.login_facebook);
router.get("/login-facebook/callback", auth_controller.login_facebook_callback);

// Export
module.exports = router;