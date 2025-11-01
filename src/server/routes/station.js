const express = require("express");
const router = express.Router();
const { saveStation, getAllStations, getStationById, deleteStation, updateStation } = require("../controllers/station");

router.post("/store", saveStation);
router.get("/index", getAllStations);
router.get("/:id", getStationById);
router.delete("/:id", deleteStation);
router.put("/:id", updateStation);

module.exports = router;
