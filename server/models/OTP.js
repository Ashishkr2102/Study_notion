const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	// Create a transporter to send emails

	// Define the email options

	// Send the email
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
		console.log("Email sent successfully: ", mailResponse.response);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

// Define a pre-save hook to send email after the document has been saved
OTPSchema.pre("save", function (next) {
	console.log("New document saved to database");

	// Call next() immediately so the OTP is saved and HTTP response is sent quickly
	// Email is sent in the background (fire-and-forget) so SMTP issues never block the API
	if (this.isNew) {
		const email = this.email;
		const otp = this.otp;
		// Fire-and-forget: do NOT await this
		sendVerificationEmail(email, otp).catch((error) => {
			console.log("Background email sending failed:", error.message);
		});
	}
	next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;