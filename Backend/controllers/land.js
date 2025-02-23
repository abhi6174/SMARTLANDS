const Land = require('../models/landModel');

const getAllLands = async (req, res) => {
  try {
    const lands = await Land.find();
    res.status(200).json(lands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lands" });
  }
};

const getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.status(200).json(land);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve land" });
  }
};

const createLand = async (req, res) => {
  try {
    const newLand = new Land(req.body);
    await newLand.save();
    res.status(201).json({ message: "Land added successfully", newLand });
  } catch (error) {
    res.status(500).json({ error: "Failed to add land" });
  }
};

const updateLandById = async (req, res) => {
  try {
    const updatedLand = await Land.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLand) return res.status(404).json({ error: "Land record not found" });
    res.status(200).json({ message: "Land details updated", updatedLand });
  } catch (error) {
    res.status(500).json({ error: "Failed to update land details" });
  }
};

const deleteLandById = async (req, res) => {
  try {
    const deletedLand = await Land.findByIdAndDelete(req.params.id);
    if (!deletedLand) return res.status(404).json({ error: "Land not found" });
    res.status(200).json({ message: "Land record deleted", deletedLand });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete land record" });
  }
};

module.exports = { getAllLands, getLandById, createLand, updateLandById, deleteLandById }; // Export controllers correctly
