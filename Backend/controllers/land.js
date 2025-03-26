const Land = require('../models/land');
const ethers = require('ethers');
const { landRegistry } = require('../config/contract');

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

const getMarketplaceLands = async (req, res) => {
  try {
    const { owner } = req.query;

    if (!owner) {
      return res.status(400).json({ 
        success: false,
        error: "Owner wallet address is required" 
      });
    }

    const filter = landRegistry.filters.LandRegistered();
    const events = await landRegistry.queryFilter(filter);

    const marketplaceLands = [];

    for (const event of events) {
      const decodedEvent = decodeLandRegisteredEvent(event);
      const landDetails = await landRegistry.lands(decodedEvent.landId);

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

    res.status(200).json({ 
      success: true,
      data: marketplaceLands 
    });
  } catch (error) {
    console.error("Error fetching marketplace lands:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch marketplace lands" 
    });
  }
};

// controllers/land.js
const getAllLands = async (req, res) => {
  try {
    const { owner } = req.query;
    let lands = [];

    if (owner) {
      // Filter lands by owner
      lands = await Land.find({ walletAddress: owner });
    } else {
      // Get all lands
      lands = await Land.find({});
    }

    res.status(200).json({ 
      success: true,
      data: lands || [] // Ensure we always return an array
    });
  } catch (error) {
    console.error("Error fetching lands:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch lands",
      data: [] // Return empty array on error
    });
  }
};

const getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) {
      return res.status(404).json({ 
        success: false,
        error: "Land not found" 
      });
    }
    res.status(200).json({ 
      success: true,
      data: land 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve land" 
    });
  }
};

const createLand = async (req, res) => {
  const { ownerName, landArea, district, taluk, village, blockNumber, surveyNumber, walletAddress } = req.body;

  if (!ownerName || !landArea || !district || !taluk || !village || !blockNumber || !surveyNumber || !walletAddress) {
    return res.status(400).json({ 
      success: false,
      error: "All fields are required" 
    });
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
    registrationDate: new Date().toISOString(),
    status: "Pending Verification"
  };

  try {
    const newLand = new Land(sanitizedData);
    await newLand.save();
    
    res.status(201).json({ 
      success: true,
      message: "Land added successfully", 
      data: newLand 
    });
  } catch (error) {
    console.error("Error adding land:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: "Survey number already exists" 
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false,
      error: "Failed to add land" 
    });
  }
};

const updateLandById = async (req, res) => {
  try {
    const updatedLand = await Land.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!updatedLand) {
      return res.status(404).json({ 
        success: false,
        error: "Land record not found" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: "Land details updated", 
      data: updatedLand 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to update land details" 
    });
  }
};

const deleteLandById = async (req, res) => {
  try {
    const deletedLand = await Land.findByIdAndDelete(req.params.id);
    
    if (!deletedLand) {
      return res.status(404).json({ 
        success: false,
        error: "Land not found" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: "Land record deleted", 
      data: deletedLand 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to delete land record" 
    });
  }
};

const transferLandOwnership = async (req, res) => {
  const { landId, newOwnerAddress } = req.body;
  
  try {
    const landIdHash = ethers.keccak256(ethers.toUtf8Bytes(landId));
    const tx = await landRegistry.transferOwnership(
      landIdHash, 
      newOwnerAddress, 
      { value: ethers.parseEther("0.01") }
    );
    
    await tx.wait();
    
    // Update database record
    await Land.findOneAndUpdate(
      { landId },
      { ownerAddress: newOwnerAddress, status: "Transferred" }
    );

    res.status(200).json({ 
      success: true,
      message: "Ownership transferred successfully", 
      txHash: tx.hash 
    });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to transfer ownership" 
    });
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
      to: ethers.getAddress('0x' + log.topics[3].slice(-40)),
      timestamp: new Date(log.blockTimestamp * 1000).toISOString()
    }));
    
    res.status(200).json({ 
      success: true,
      data: transfers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch land history" 
    });
  }
};

const acceptPurchaseRequest = async (req, res) => {
  const { landId, buyerAddress } = req.body;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      LandRegistryABI,
      signer
    );

    const landIdHash = ethers.keccak256(ethers.toUtf8Bytes(landId));
    const tx = await contract.acceptPurchaseRequest(landIdHash, buyerAddress);
    await tx.wait();

    const updatedLand = await Land.findOneAndUpdate(
      { landId },
      { 
        ownerAddress: buyerAddress, 
        status: "Sold",
        lastTransfer: new Date().toISOString()
      },
      { new: true }
    );

    res.status(200).json({ 
      success: true,
      message: "Purchase request accepted successfully", 
      data: updatedLand,
      txHash: tx.hash
    });
  } catch (error) {
    console.error("Error accepting purchase request:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to accept purchase request" 
    });
  }
};

const getNonVerifiedLands = async (req, res) => {
  try {
    const lands = await Land.find({ status: { $ne: "Verified" } });
    
    // Also check blockchain for pending verifications
    const filter = landRegistry.filters.LandRegistered();
    const events = await landRegistry.queryFilter(filter);
    
    const blockchainPending = [];
    
    for (const event of events) {
      const decodedEvent = decodeLandRegisteredEvent(event);
      const landDetails = await landRegistry.lands(decodedEvent.landId);
      
      if (landDetails.status !== "Verified") {
        blockchainPending.push({
          landId: decodedEvent.landId.toString(),
          ownerName: decodedEvent.ownerName,
          ownerAddress: decodedEvent.owner,
          district: landDetails.district,
          taluk: landDetails.taluk,
          village: landDetails.village,
          status: "Pending Verification"
        });
      }
    }

    res.status(200).json({ 
      success: true,
      data: [...lands, ...blockchainPending] 
    });
  } catch (error) {
    console.error("Error fetching non-verified lands:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch non-verified lands" 
    });
  }
};

const verifyLand = async (req, res) => {
  try {
    const { landId } = req.body;
    
    // Update database
    const dbLand = await Land.findByIdAndUpdate(
      landId,
      { status: "Verified", verificationDate: new Date() },
      { new: true }
    );
    
    // Update blockchain
    const landIdHash = ethers.keccak256(ethers.toUtf8Bytes(dbLand._id.toString()));
    const tx = await landRegistry.verifyLand(landIdHash);
    await tx.wait();

    res.status(200).json({ 
      success: true,
      message: "Land verified successfully",
      data: dbLand,
      txHash: tx.hash
    });
  } catch (error) {
    console.error("Error verifying land:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to verify land" 
    });
  }
};

module.exports = {
  getAllLands,
  getMarketplaceLands,
  getNonVerifiedLands,
  verifyLand,
  getLandById,
  createLand,
  updateLandById,
  deleteLandById,
  transferLandOwnership,
  getLandHistory,
  acceptPurchaseRequest
};