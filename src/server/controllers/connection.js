const Connection = require("../models/Connection");

exports.saveConnection = async (req, res) => {
    try {
        const { name, color, description, stationsId, type } = req.body;

        if (!name || !color || !stationsId || !type) {
            return res.status(400).json({ error: "name, color, stationsId, and type are required" });
        }

        const newConnection = new Connection({ name, color, description, stationsId, type });
        await newConnection.save();

        res.status(201).json({ message: "Connection created successfully", data: newConnection });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getConnections = async (req, res) => {
    try {
        const connections = await Connection.find().populate("stationsId");
        res.status(200).json({ data: connections });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getConnectionById = async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id).populate("stationsId");
        if (!connection) {
            return res.status(404).json({ error: "Connection not found" });
        }
        res.status(200).json({ data: connection });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteConnection = async (req, res) => {
    try {
        const connection = await Connection.findByIdAndDelete(req.params.id);
        if (!connection) {
            return res.status(404).json({ error: "Connection not found" });
        }
        res.status(200).json({ message: "Connection deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};