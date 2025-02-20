
const Land =require("../models/land")

// Get all land records
const getAllLands = async (req, res) => {
  try {
    const lands = await Land.find();
    res.status(200).json(lands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch land records" });
  }
};

// Get a single land record by ID
const getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ error: "Land record not found" });
    res.status(200).json(land);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch land record" });
  }
};

// Create a new land record
const createLand = async (req, res) => {

    const body = req.body;
    console.log(body);

    if (!body || !body.ownerName || !body.landArea || !body.district || !body.taluk || !body.village || !body.blockNumber || !body.surveyNumber) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const result = await Land.create({
            ownerName: body.ownerName,id

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
        return res.status(500).json({ error: "Internal Server Error" });id

    }
    
    
};

// Update land details by ID
const updateLandById = async (req, res) => {
  try {
    const updatedLand = await Land.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLand) return res.status(404).json({ error: "Land record not found" });
    res.status(200).json({ message: "Land details updated", updatedLand });
  } catch (error) {
    res.status(500).json({ error: "Failed to update land details" });
  }
};

// Delete a land record
const deleteLandById = async (req, res) => {
  try {
    const deletedLand = await Land.findByIdAndDelete(req.params.id);
    if (!deletedLand) return res.status(404).json({ error: "Land record not found" });
    res.status(200).json({ message: "Land record deleted", deletedLand });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete land record" });
  }
};

// Export functions
module.exports = { getAllLands, getLandById, createLand, updateLandById, deleteLandById };
