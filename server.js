const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");

// Import custom modules
const routes = require("./src/server/routes");
const errorHandler = require("./src/server/middleware/errorHandler");
const logger = require("./src/server/middleware/logger");
const connectDB = require("./config/database");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (must come before static file serving)
app.use("/", routes);

// Serve client assets
app.use("/css", express.static(path.join(__dirname, "src", "client", "css")));
app.use("/js", express.static(path.join(__dirname, "src", "client", "js")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Serve static frontend files from /public (fallback for unmatched routes)
app.use(express.static(path.join(__dirname, "src", "public")));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});
// Test comment to trigger restart
