const express = require("express");
const router = express.Router();
const { saveConnection, getConnections, getConnectionById, deleteConnection } = require("../controllers/connection");

router.post("/", saveConnection);
router.get("/", getConnections);
router.get("/:id", getConnectionById);
router.delete("/:id", deleteConnection);

module.exports = router;