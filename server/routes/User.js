// Import the required modules
const express = require("express")
const router = express.Router()
const mailSender = require("../utils/mailSender")

// Import the required controllers and middleware functions
const {
  login,
  signup,
  sendotp,
  changePassword,
} = require("../controllers/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// ── DIAGNOSTIC: remove this route after confirming email works ──────────────
// Usage: GET /api/v1/auth/test-email?email=youremail@gmail.com
router.get("/test-email", async (req, res) => {
  const email = req.query.email
  if (!email) return res.status(400).json({ success: false, message: "Provide ?email= param" })
  try {
    const result = await mailSender(email, "StudyNotion Test Email", "<h2>SMTP is working ✅</h2><p>Your email config on Render is correct.</p>")
    return res.status(200).json({ success: true, message: "Email sent", response: result?.response })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
})
// ────────────────────────────────────────────────────────────────────────────

// Export the router for use in the main application
module.exports = router