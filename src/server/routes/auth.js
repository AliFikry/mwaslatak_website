const express = require("express");
const router = express.Router();
const { registerUser, loginUser, googleSignIn } = require("../controllers/auth");

// Register route
router.post("/register", registerUser);


router.post("/login", loginUser);
router.post("/google", googleSignIn);

module.exports = router;

// http://localhost:3000/api/auth/register