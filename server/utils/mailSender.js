const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        // Skip email if mail credentials are not configured
        if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            console.log("Mail credentials not configured. Skipping email to:", email);
            return { response: "Email skipped - credentials not configured" };
        }

        // Remove any spaces from the app password (Gmail app passwords are 16 chars, no spaces)
        const mailPass = process.env.MAIL_PASS.replace(/\s/g, "");

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false, // true for 465, false for other ports (STARTTLS)
            auth: {
                user: process.env.MAIL_USER,
                pass: mailPass,
            },
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });

        // Race the sendMail against a 20-second timeout so the server never hangs
        const sendMailPromise = transporter.sendMail({
            from: `"StudyNotion" <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Email send timed out after 20 seconds")), 20000)
        );

        const info = await Promise.race([sendMailPromise, timeoutPromise]);
        console.log("Email sent:", info.response);
        return info;
    } catch (error) {
        console.log("Mail send error:", error.message);
        // Return gracefully instead of throwing — let callers decide how to handle
        return { response: "Email failed - " + error.message };
    }
};

module.exports = mailSender;