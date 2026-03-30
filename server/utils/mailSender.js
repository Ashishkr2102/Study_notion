const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const sgMail = require("@sendgrid/mail");

const mailSender = async (email, title, body) => {

    // ── Strategy 1: SendGrid (HTTPS – free, any recipient, only needs sender verified) ──
    if (process.env.SENDGRID_API_KEY) {
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.MAIL_USER;

            await sgMail.send({
                from: { name: "StudyNotion", email: fromEmail },
                to: email,
                subject: title,
                html: body,
            });

            console.log("Email sent via SendGrid to:", email);
            return { response: "OK" };
        } catch (err) {
            const detail = err.response?.body?.errors?.[0]?.message || err.message;
            console.log("SendGrid error:", detail);
            return { response: "Email failed - " + detail };
        }
    }

    // ── Strategy 2: Resend API (HTTPS – requires verified domain for other recipients) ──
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

            const { data, error } = await resend.emails.send({
                from: `StudyNotion <${fromEmail}>`,
                to: [email],
                subject: title,
                html: body,
            });

            if (error) {
                console.log("Resend API error:", error.message || JSON.stringify(error));
                return { response: "Email failed - " + (error.message || JSON.stringify(error)) };
            }

            console.log("Email sent via Resend. ID:", data.id);
            return { response: "OK", id: data.id };
        } catch (err) {
            console.log("Resend exception:", err.message);
            return { response: "Email failed - " + err.message };
        }
    }

    // ── Strategy 3: Nodemailer / Gmail SMTP (local dev fallback) ─────────────
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.log("No email provider configured. Skipping email to:", email);
        return { response: "Email skipped - no provider configured" };
    }

    try {
        const mailPass = process.env.MAIL_PASS.replace(/\s/g, "");

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: mailPass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });

        const sendMailPromise = transporter.sendMail({
            from: `"StudyNotion" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("SMTP timed out after 20 seconds")), 20000)
        );

        const info = await Promise.race([sendMailPromise, timeoutPromise]);
        console.log("Email sent via SMTP:", info.response);
        return info;
    } catch (error) {
        console.log("SMTP mail send error:", error.message);
        return { response: "Email failed - " + error.message };
    }
};

module.exports = mailSender;