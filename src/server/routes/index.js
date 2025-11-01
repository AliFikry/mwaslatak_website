// const express = require('express');
// const path = require('path');
// const router = express.Router();
// const jwt = require('jsonwebtoken');


// module.exports = router;


const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const stationRoutes = require("./station");
const connectionRoutes = require("./connection");

// API Routes
router.use("/api/auth", authRoutes);
router.use("/api/stations", stationRoutes);
router.use("/api/connections", connectionRoutes);

router.get("/", (req, res) => {
    res.send("🚀 Mwaslatak Transport API is running...");
});

module.exports = router;
