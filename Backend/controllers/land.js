// backend/controllers/land.js
const Land = require('../models/land');
const ethers = require('ethers');
const { landRegistry } = require('../config/contract'); // Import the contract instance

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
      if (decodedEvent.owner.toLowerCase() !== owner.toLowerCase()) {
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
    walletAddress: walletAddress,
  };

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
  const { landId, buyerAddress } = req.body;

  try {
    const { ethereum } = window;
    if (!ethereum) {
      throw new Error("MetaMask is not installed!");
    }

    // Connect to the smart contract
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const landRegistry = new ethers.Contract(
      contractAddress, // Use environment variable for contract address
      LandRegistryABI, // Ensure the ABI is imported
      signer
    );

    // Call the acceptPurchaseRequest function in the smart contract
    const landIdHash = ethers.keccak256(ethers.toUtf8Bytes(landId));
    const tx = await landRegistry.acceptPurchaseRequest(landIdHash, buyerAddress);

    // Wait for the transaction to be mined
    await tx.wait();

    // Update the land record in the database
    const updatedLand = await Land.findOneAndUpdate(
      { landId },
      { ownerAddress: buyerAddress, status: "Sold" },
      { new: true }
    );

    res.status(200).json({ message: "Purchase request accepted successfully", updatedLand });
  } catch (error) {
    console.error("Error accepting purchase request:", error);
    res.status(500).json({ error: "Failed to accept purchase request" });
  }
};


module.exports = { getAllLands,getMarketplaceLands ,getLandById, createLand, updateLandById, deleteLandById, transferLandOwnership, getLandHistory, acceptPurchaseRequest}; 