const Land = require('../models/land');
const ethers = require('ethers');
const { landRegistry } = require('../config/contract');

// Helper function to decode LandRegistered event logs
const landRegisteredAbi = ["event LandRegistered(bytes32 indexed landId, address indexed owner, string ownerName)"];
const iface = new ethers.Interface(landRegisteredAbi);

const decodeLandRegisteredEvent = (log) => {
  const decodedLog = iface.parseLog(log);
  return {
    landId: decodedLog.args.landId,
    owner: decodedLog.args.owner,
    ownerName: decodedLog.args.ownerName,
  };
};

// Helper function to fetch lands from blockchain
const fetchLandsFromBlockchain = async (filter, owner = null, operator = '===') => {
  const events = await landRegistry.queryFilter(filter);
  const lands = [];

  for (const event of events) {
    const decodedEvent = decodeLandRegisteredEvent(event);
    const landDetails = await landRegistry.lands(decodedEvent.landId);

    // Determine whether to include the land based on the operator
    const shouldIncludeLand = operator === '==='
      ? landDetails.ownerAddress.toLowerCase() === owner?.toLowerCase()
      : landDetails.ownerAddress.toLowerCase() !== owner?.toLowerCase();

    if (!owner || shouldIncludeLand) {
      lands.push({
        landId: decodedEvent.landId.toString(),
        ownerName: landDetails.ownerName,
        landArea: landDetails.landArea.toString(),
        district: landDetails.district,
        taluk: landDetails.taluk,
        village: landDetails.village,
        blockNumber: landDetails.blockNumber.toString(),
        surveyNumber: landDetails.surveyNumber.toString(),
        ownerAddress: landDetails.ownerAddress,
        status: "Verified",
      });
    }
    
  }

  return lands;
};

// Get user lands
const getUserLands = async (req, res) => {
  try {
    const { owner } = req.query;
    const filter = landRegistry.filters.LandRegistered();
    const lands = await fetchLandsFromBlockchain(filter, owner);

    res.status(200).json(lands);
  } catch (error) {
    console.error("Error fetching lands:", error);
    res.status(500).json({ error: "Failed to fetch lands" });
  }
};
// Get marketplace lands
const getMarketplaceLands = async (req, res) => {
  try {
    const { owner } = req.query;
    if (!owner) {
      return res.status(400).json({ error: "Owner wallet address is required" });
    }

    const filter = landRegistry.filters.LandRegistered();
    const marketplaceLands = await fetchLandsFromBlockchain(filter, owner, "!==");

    res.status(200).json(marketplaceLands);
  } catch (error) {
    console.error("Error fetching marketplace lands:", error);
    res.status(500).json({ error: "Failed to fetch marketplace lands" });
  }
};
const getLandsWithPurchaseRequests = async (req, res) => {
  try {
    const { owner, buyer } = req.query;

    if (!owner && !buyer) {console.log("land details ",landDetails)
      return res.status(400).json({ error: "Owner or buyer wallet address is required." });
    }
    const query = {};
    if (owner) {
      query.walletAddress = owner.toLowerCase();
    }
    if (buyer) {
      query["purchaseRequests.buyerAddress"] = buyer.toLowerCase();
    }
    // Fetch lands and filter out those with "accepted" requests
    const lands = await Land.find(query);
    const filteredLands = lands.filter((land) => {
      // Check if any purchase request is "accepted"
      const hasAcceptedRequest = land.purchaseRequests.some(
        (request) => request.status === "accepted"
      );
      return !hasAcceptedRequest; // Exclude lands with accepted requests
    });

    res.status(200).json(filteredLands);
  } catch (error) {
    console.error("Error fetching lands with purchase requests:", error);
    res.status(500).json({ error: "Failed to fetch lands" });
  }
};

const getLandsForPayment = async (req, res) => {
  try {
    const { buyer } = req.query;

    // Validate buyer address
    if (!buyer || !/^0x[a-fA-F0-9]{40}$/.test(buyer)) {
      return res.status(400).json({ error: "Valid buyer wallet address is required." });
    }

    console.log("Buyer:", buyer); // Log the buyer address

    // Fetch lands where the buyer has at least one "accepted" purchase request
    const lands = await Land.find({
      purchaseRequests: {
        $elemMatch: {
          buyerAddress: buyer.toLowerCase(), // Match buyer address
          status: "accepted", // Match accepted status
        },
      },
    });

    res.status(200).json(lands);
  } catch (error) {
    console.error("Error fetching lands for payment:", error);
    res.status(500).json({ error: "Failed to fetch lands for payment" });
  }
};

const addPurchaseRequest = async (req, res) => {
  const { landId, buyerAddress, buyerName } = req.body;

  try {
    const land = await Land.findOne({ landId });
    if (!land) {
      return res.status(404).json({ error: "Land not found" });
    }

    // Check if the buyer already has a pending or accepted request for this land
    const existingRequest = land.purchaseRequests.find(
      (request) =>
        request.buyerAddress.toLowerCase() === buyerAddress.toLowerCase()
    );

    if (existingRequest) {
      return res.status(400).json({
        error: "You have already submitted a purchase request for this land.",
      });
    }

    // Add the new purchase request
    land.purchaseRequests.push({ buyerAddress, buyerName });
    await land.save();

    res.status(200).json({ message: "Purchase request sent successfully", land });
  } catch (error) {
    console.error("Error adding purchase request:", error);
    res.status(500).json({ error: "Failed to send purchase request" });
  }
};

// Get land by ID
const getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) {
      return res.status(404).json({ error: "Land not found" });
    }
    res.status(200).json(land);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve land" });
  }
};

// Register a new land
const createLand = async (req, res) => {
  const { ownerName, landArea, district, taluk, village, blockNumber, surveyNumber, walletAddress } = req.body;

  if (!ownerName || !landArea || !district || !taluk || !village || !blockNumber || !surveyNumber || !walletAddress) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sanitizedData = {
    ownerName: ownerName.trim(),
    landArea: parseFloat(landArea),
    district: district.trim(),
    taluk: taluk.trim(),
    village: village.trim(),
    blockNumber: parseInt(blockNumber),
    surveyNumber: parseInt(surveyNumber),
    walletAddress,
    status: "not verified",
  };

  const landId = ethers.solidityPackedKeccak256(
    ["uint256", "string", "string", "string", "uint256", "uint256"],
    [sanitizedData.landArea, sanitizedData.district, sanitizedData.taluk, sanitizedData.village, sanitizedData.blockNumber, sanitizedData.surveyNumber]
  );

  const existsOnChain = await landRegistry.landExists(landId);
  if (!existsOnChain) {
    return res.status(400).json({ error: "Land not registered on blockchain" });
  }

  sanitizedData.landId = landId;

  try {
    const newLand = new Land(sanitizedData);
    await newLand.save();
    res.status(201).json({ message: "Land added successfully", land: newLand });
  } catch (error) {
    console.error("Error adding land:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Survey number already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to add land" });
  }
};

// Update land by ID
const updateLandById = async (req, res) => {
  try {
    const updatedLand = await Land.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLand) {
      return res.status(404).json({ error: "Land record not found" });
    }
    res.status(200).json({ message: "Land details updated", updatedLand });
  } catch (error) {
    res.status(500).json({ error: "Failed to update land details" });
  }
};

// Delete land by ID
const deleteLandById = async (req, res) => {
  try {
    const deletedLand = await Land.findByIdAndDelete(req.params.id);
    if (!deletedLand) {
      return res.status(404).json({ error: "Land not found" });
    }
    res.status(200).json({ message: "Land record deleted", deletedLand });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete land record" });
  }
};

// Transfer land ownership
const transferLandOwnership = async (req, res) => {
  const { landId, buyerAddress, buyerName } = req.body;

  try {
    // Validate input
    if (!landId || !buyerAddress || !buyerName) {
      return res.status(400).json({ error: "Land ID, buyer address, and buyer name are required." });
    }

    // Fetch the land details from the database
    const land = await Land.findOne({ landId });
    if (!land) {
      return res.status(404).json({ error: "Land not found in the database." });
    }

    // Ensure the land is not already sold
    if (land.status === "Sold") {
      return res.status(400).json({ error: "Land is already sold." });
    }

    // Update the land record in the database
    land.ownerAddress = buyerAddress;
    land.ownerName = buyerName;
    land.status = "Sold";
    land.purchaseRequests = land.purchaseRequests.filter(request => request.buyerAddress !== buyerAddress);
    await land.save();

    // Return success response
    res.status(200).json({ message: "Ownership transferred successfully" });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    res.status(500).json({ error: `Failed to transfer ownership: ${error.message}` });
  }
};

// Accept purchase request
const acceptPurchaseRequest = async (req, res) => {
  const { landId, buyerAddress, buyerName } = req.body;
  try {
    const land = await Land.findOne({ landId });
    if (!land) {
      return res.status(404).json({ error: "Land not found" });
    }

    // Update the request status to "accepted"
    const request = land.purchaseRequests.find(
      (req) => req.buyerAddress === buyerAddress
    );
    if (!request) {
      return res.status(404).json({ error: "Purchase request not found" });
    }
    request.status = "accepted";
    await land.save();

    res.status(200).json({ message: "Purchase request accepted successfully", land });
  } catch (error) {
    console.error("Error accepting purchase request:", error);
    res.status(500).json({ error: "Failed to accept purchase request" });
  }
};

// Notify the buyer to pay for the transaction
const notifyBuyer = (buyerAddress, landId) => {
  // In a real app, this would trigger a UI prompt for the buyer to pay
  console.log(`Notifying buyer ${buyerAddress} to pay for land ${landId}`);
};

module.exports = {
  getLandsWithPurchaseRequests,
  addPurchaseRequest,
  getMarketplaceLands,
  getUserLands,
  getLandsForPayment,
  getLandById,
  createLand,
  updateLandById,
  deleteLandById,
  transferLandOwnership,
  acceptPurchaseRequest,
};