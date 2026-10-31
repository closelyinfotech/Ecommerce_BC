const express = require("express");
const router = express.Router();
const {
  Register,
  Login,
  IssueToken,
} = require("../controller/authController");

// Public authentication endpoints
router.post("/register", Register);
router.post("/login", Login);
router.post("/token", IssueToken);

module.exports = router;
