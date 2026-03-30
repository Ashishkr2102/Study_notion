const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: true,
		credentials: true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

//def route

app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running....",
	});
});

// Health check endpoint – use with UptimeRobot to keep Render warm
app.get("/health", (req, res) => {
	return res.status(200).json({ success: true, message: "Server is healthy" });
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`);

	// Self-ping every 14 minutes so Render free tier never spins down mid-session
	// Render idles after 15 minutes of no traffic
	const RENDER_URL = process.env.RENDER_EXTERNAL_URL || "";
	if (RENDER_URL) {
		setInterval(() => {
			const https = require("https");
			https
				.get(`${RENDER_URL}/health`, (res) => {
					console.log(`Keepalive ping status: ${res.statusCode}`);
				})
				.on("error", (err) => {
					console.log("Keepalive ping failed:", err.message);
				});
		}, 14 * 60 * 1000);
	}
});

