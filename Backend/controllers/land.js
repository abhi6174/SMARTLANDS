const Land = require('../models/land');

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
  const { ownerName,walletAddress, status,landArea, district, taluk, village, blockNumber, surveyNumber } = req.body;

  // Input validation
  if (!ownerName ||!walletAddress ||!status|| !landArea || !district || !taluk || !village || !blockNumber || !surveyNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Data sanitization (optional)
  const sanitizedData = {
    ownerName: ownerName.trim(),
    walletAddress:walletAddress.trim(),
    landArea: parseFloat(landArea),
    district: district.trim(),
    taluk: taluk.trim(),
    village: village.trim(),
    blockNumber: parseInt(blockNumber),
    surveyNumber: parseInt(surveyNumber),
    status:status
  };
  try {
    console.log("adding",sanitizedData)
    // Create and save the new land record
    const newLand = new Land(sanitizedData);
    await newLand.save();

    // Log success
    console.log("Land added successfully:", newLand);

    // Return success response
    res.status(201).json({ message: "Land added successfully", land: newLand });
  } catch (error) {
    // Log the error
    console.error("Error adding land:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    // Handle other errors
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

module.exports = { getAllLands, getLandById,createLand, updateLandById, deleteLandById }; // Export controllers correctly
