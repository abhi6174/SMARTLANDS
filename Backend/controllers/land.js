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
<<<<<<< HEAD
  try {
    const newLand = new Land(req.body);
    await newLand.save();
    res.status(201).json({ message: "Land added successfully", newLand });
  } catch (error) {
    res.status(500).json({ error: "Failed to add land" });
  }
=======

    const body = req.body;
    console.log(body);

    if (!body || !body.ownerName || !body.landArea || !body.district || !body.taluk || !body.village || !body.blockNumber || !body.surveyNumber) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const result = await Land.create({
            ownerName: body.ownerName,
            landArea: body.landArea,
            district: body.district,
            taluk: body.taluk,
            village: body.village,
            blockNumber: body.blockNumber,
            surveyNumber: body.surveyNumber
        });

        console.log("Land entry created:", result);
        return res.status(201).json({ msg: "Success", land: result });
    } catch (error) {
        console.error("Error creating land entry:", error);
        return res.status(500).json({ error: "Internal Server Error" });

    }
    
    
>>>>>>> refs/remotes/origin/main
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
