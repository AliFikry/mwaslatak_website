// app.post("/stations", async (req, res) => {
//     try {
//         const { name, lat, lng } = req.body;

//         if (!name || lat == null || lng == null) {
//             return res.status(400).json({ error: "name, lat, and lng are required" });
//         }

//         const newStation = new Station({ name, lat, lng });
//         await newStation.save();

//         res.status(201).json({ message: "Station created successfully", data: newStation });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

const Station = require("../models/Station");

exports.saveStation = async (req, res) => {
    try {
        const { name, lat, lng, description } = req.body;

        if (!name || lat == null || lng == null) {
            return res.status(400).json({ error: "name, lat, and lng are required" });
        }

        const newStation = new Station({ name, lat, lng, description });
        await newStation.save();

        res.status(201).json({ message: "Station created successfully", data: newStation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllStations = async (req, res) => {
    try {
        const stations = await Station.find();
        res.status(200).json(stations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStationById = async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ error: "Station not found" });
        }
        res.status(200).json(station);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteStation = async (req, res) => {
    try {
        const station = await Station.findByIdAndDelete(req.params.id);
        if (!station) {
            return res.status(404).json({ error: "Station not found" });
        }
        res.status(200).json({ message: "Station deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.updateStation = async (req, res) => {
    try {
        const { name, lat, lng, description } = req.body;

        const station = await Station.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ error: "Station not found" });
        }

        station.name = name || station.name;
        station.lat = lat != null ? lat : station.lat;
        station.lng = lng != null ? lng : station.lng;
        station.description = description || station.description;

        await station.save();

        res.status(200).json({ message: "Station updated successfully", data: station });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};