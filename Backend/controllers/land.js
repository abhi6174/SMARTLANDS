// backend/controllers/land.js
const Land = require('../models/land');
const ethers = require('ethers');
const { landRegistry } = require('../config/contract'); // Import the contract instance

const getLandsWithPurchaseRequests = async (req, res) => {
  try {
    const { owner } = req.query;
    console.log("Owner:", owner);

    if (!owner) {
      return res.status(400).json({ error: "Owner wallet address is required" });
    }

    // Fetch lands where the seller is the owner and purchaseRequests exist
    const lands = await Land.find({
      walletAddress: owner.toLowerCase(), // Seller's wallet address
      purchaseRequests: { $exists: true, $not: { $size: 0 } }, // Ensure purchaseRequests array is not empty
    });

    console.log("Lands with purchase requests:", lands);
    res.status(200).json(lands);
  } catch (error) {
    console.error("Error fetching lands with purchase requests:", error);
    res.status(500).json({ error: "Failed to fetch lands" });
  }
};

const addPurchaseRequest = async (req, res) => {
  const { landId, buyerAddress, buyerName } = req.body;

  console.log("Received purchase request:", { landId, buyerAddress, buyerName });

  try {
    // Find the land by landId (keccak hash)
    const land = await Land.findOne({ landId });
    console.log("Found land:", land);

    if (!land) {
      console.error("Land not found for landId:", landId);
      return res.status(404).json({ error: "Land not found" });
    }

    // Add the purchase request to the land
    land.purchaseRequests.push({ buyerAddress, buyerName });
    await land.save();

    console.log("Purchase request added successfully:", land);
    res.status(200).json({ message: "Purchase request sent successfully", land });
  } catch (error) {
    console.error("Error adding purchase request:", error);
    res.status(500).json({ error: "Failed to send purchase request" });
  }
};
// ABI for the LandRegistered event
const landRegisteredAbi = [
  "event LandRegistered(bytes32 indexed landId, address indexed owner, string ownerName)"
];

// Create an interface for decoding
const iface = new ethers.Interface(landRegisteredAbi);

// Function to decode a single log
const decodeLandRegisteredEvent = (log) => {
  const decodedLog = iface.parseLog(log);
  return {
    landId: decodedLog.args.landId,
    owner: decodedLog.args.owner,
    ownerName: decodedLog.args.ownerName,
  };
};

// File: backend/controllers/land.js
const getMarketplaceLands = async (req, res) => {
  try {
    const { owner } = req.query; // Get the owner's wallet address from query params

    // Validate the owner query parameter
    if (!owner) {
      return res.status(400).json({ error: "Owner wallet address is required" });
    }


    // Get all LandRegistered events
    const filter = landRegistry.filters.LandRegistered();
    const events = await landRegistry.queryFilter(filter);

    const marketplaceLands = [];

    for (const event of events) {
      // Decode the event log
      const decodedEvent = decodeLandRegisteredEvent(event);

      // Get additional details from the contract
      const landDetails = await landRegistry.lands(decodedEvent.landId);

      // Exclude lands owned by the current user
      if (landDetails.ownerAddress.toLowerCase() !== owner.toLowerCase()) {
        marketplaceLands.push({
          landId: decodedEvent.landId.toString(),
          ownerName: decodedEvent.ownerName,
          landArea: landDetails.landArea.toString(),
          district: landDetails.district,
          taluk: landDetails.taluk,
          village: landDetails.village,
          blockNumber: landDetails.blockNumber.toString(),
          surveyNumber: landDetails.surveyNumber.toString(),
          ownerAddress: decodedEvent.owner,
          status: "Verified",
        });
      }
    }

    res.status(200).json(marketplaceLands);
  } catch (error) {
    console.error("Error fetching marketplace lands:", error);
    res.status(500).json({ error: "Failed to fetch marketplace lands" });
  }
};
// Function to get all registered lands

const getAllLands = async (req, res) => {
  try {
    const { owner } = req.query; // Get the owner's wallet address from query params
    // Get all LandRegistered events
    const filter = landRegistry.filters.LandRegistered();
    const events = await landRegistry.queryFilter(filter);

    const lands = [];

    for (const event of events) {
      // Decode the event log
      const decodedEvent = decodeLandRegisteredEvent(event);

      // Get additional details from the contract
      const landDetails = await landRegistry.lands(decodedEvent.landId);

      // Filter lands by owner's wallet address (if provided)
      if (!owner || decodedEvent.owner.toLowerCase() === owner.toLowerCase()) {
        lands.push({
          landId: decodedEvent.landId.toString(),
          ownerName: decodedEvent.ownerName,
          landArea: landDetails.landArea.toString(),
          district: landDetails.district,
          taluk: landDetails.taluk,
          village: landDetails.village,
          blockNumber: landDetails.blockNumber.toString(),
          surveyNumber: landDetails.surveyNumber.toString(),
          ownerAddress: decodedEvent.owner,
          status: "Verified",
        });
      }
    }

    res.status(200).json(lands);
  } catch (error) {
    console.error("Error fetching lands:", error);
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
// File: backend/controllers/land.js  

const createLand = async (req, res) => {
  const { ownerName, landArea, district, taluk, village, blockNumber, surveyNumber, walletAddress } = req.body;

  if (!ownerName || !landArea || !district || !taluk || !village || !blockNumber || !surveyNumber || !walletAddress ) {
    return res.status(400).json({ error: "All fields are required, including landId" });
  }

  const sanitizedData = {
    ownerName: ownerName.trim(),
    landArea: parseFloat(landArea),
    district: district.trim(),
    taluk: taluk.trim(),
    village: village.trim(),
    blockNumber: parseInt(blockNumber),
    surveyNumber: parseInt(surveyNumber),
    walletAddress: walletAddress,
    status: "not verified",
  };

  // Generate landId using the same logic as the smart contract
  const landId = ethers.solidityPackedKeccak256(
    ["uint256", "string", "string", "string", "uint256", "uint256"],
    [sanitizedData.landArea, sanitizedData.district, sanitizedData.taluk, 
     sanitizedData.village, sanitizedData.blockNumber, sanitizedData.surveyNumber]
  );

  // Check if land exists on blockchain
  const existsOnChain = await landRegistry.landExists(landId);
  if (!existsOnChain) {
    return res.status(400).json({ error: "Land not registered on blockchain" });
  } else {
    console.log("Land is already on blockchain");
  }

  // Add landId to the sanitizedData object
  sanitizedData.landId = landId;

  // Proceed to save in MongoDB
  try {
    const newLand = new Land(sanitizedData);
    await newLand.save();
    console.log("Land added successfully:", newLand);
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

const transferLandOwnership = async (req, res) => {
  const { landId, newOwnerAddress } = req.body;
  try {
    const landIdHash = ethers.keccak256(ethers.toUtf8Bytes(landId));
    const tx = await landRegistry.transferOwnership(landIdHash, newOwnerAddress, {
      value: ethers.parseEther("0.01") // Changed to 0.01 MATIC (0.01 ether units)
    });
    await tx.wait();
    res.status(200).json({ message: "Ownership transferred successfully", txHash: tx.hash });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    res.status(500).json({ error: "Failed to transfer ownership" });
  }
};

const getLandHistory = async (req, res) => {
  const { landId } = req.params;
  try {
    const landIdHash = ethers.keccak256(ethers.toUtf8Bytes(landId));
    const logs = await provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      address: landRegistryAddress,
      topics: [
        ethers.id("OwnershipTransferred(bytes32,address,address)"),
        landIdHash
      ]
    });
    const transfers = logs.map(log => ({
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      from: ethers.getAddress('0x' + log.topics[2].slice(-40)),
      to: ethers.getAddress('0x' + log.topics[3].slice(-40))
    }));
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch land history" });
  }
};
const acceptPurchaseRequest = async (req, res) => {
  const { landId, buyerAddress, buyerName } = req.body; // Add buyerName to the request body

  try {
    // Find the land by landId
    const land = await Land.findOne({ landId });
    if (!land) {
      return res.status(404).json({ error: "Land not found" });
    }

    // Update the ownerAddress, ownerName, and status in the database
    land.ownerAddress = buyerAddress; // Update owner address
    land.ownerName = buyerName; // Update owner name
    land.status = "Sold";

    // Remove the accepted purchase request from the array
    land.purchaseRequests = land.purchaseRequests.filter(
      request => request.buyerAddress !== buyerAddress
    );

    await land.save();
    res.status(200).json({ message: "Purchase request accepted successfully", land });
  } catch (error) {
    console.error("Error accepting purchase request:", error);
    res.status(500).json({ error: "Failed to accept purchase request" });
  }
};

module.exports = { getAllLands,getMarketplaceLands,addPurchaseRequest,getLandsWithPurchaseRequests ,getLandById, createLand, updateLandById, deleteLandById, transferLandOwnership, getLandHistory, acceptPurchaseRequest}; 