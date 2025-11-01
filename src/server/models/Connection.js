const mongoose = require("mongoose");


const connectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ["tram", "metro"], required: true },
    stationsId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true }],


}, {
    timestamps: true
});

module.exports = mongoose.model("Connection", connectionSchema);