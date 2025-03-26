const Land = require('../models/land');
const ethers = require('ethers');
const { landRegistry } = require('../config/contract');

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


// Update the createLand function
const createLand = async (req, res) => {
  const { ownerName, landArea, district, taluk, village, blockNumber, surveyNumber, walletAddress } = req.body;

  if (!ownerName || !landArea || !district || !taluk || !village || !blockNumber || !surveyNumber || !walletAddress) {
<<<<<<< HEAD
    return res.status(400).json({ error: "All fields are required" });
  }

=======
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
>>>>>>> f770ea13b91d0b2e6ffea6ec0136dee18710ee81
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Land document is required" });
    }

    // Upload document to IPFS
    const ipfsHash = await uploadToIPFS(req.file.path);

    // Generate landId
    const landId = ethers.solidityPackedKeccak256(
      ["uint256", "string", "string", "string", "uint256", "uint256"],
      [landArea, district, taluk, village, blockNumber, surveyNumber]
    );

    // Check if land exists on blockchain
    const existsOnChain = await landRegistry.landExists(landId);
    if (!existsOnChain) {
      return res.status(400).json({ error: "Land not registered on blockchain" });
    }

    // Create land data with IPFS hash
    const sanitizedData = {
      ownerName,
      landArea: parseFloat(landArea),
      district,
      taluk,
      village,
      blockNumber: parseInt(blockNumber),
      surveyNumber: parseInt(surveyNumber),
      walletAddress,
      landId,
      documentHash: ipfsHash,
      status: "not verified"
    };

    // Save to MongoDB
    const newLand = new Land(sanitizedData);
    await newLand.save();
<<<<<<< HEAD

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json({ 
      message: "Land added successfully", 
      land: newLand,
      documentIpfsHash: ipfsHash
=======
    
    res.status(201).json({ 
      success: true,
      message: "Land added successfully", 
      data: newLand 
>>>>>>> f770ea13b91d0b2e6ffea6ec0136dee18710ee81
    });
  } catch (error) {
    console.error("Error adding land:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: "Survey number already exists" 
      });
    }
<<<<<<< HEAD
    res.status(500).json({ error: "Failed to add land" });
=======
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
>>>>>>> f770ea13b91d0b2e6ffea6ec0136dee18710ee81
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
    res.status(500).json({ 
      success: false,
      error: "Failed to accept purchase request" 
    });
  }
};

<<<<<<< HEAD

module.exports = { getAllLands,getMarketplaceLands,addPurchaseRequest,getLandsWithPurchaseRequests ,getLandById, createLand, updateLandById, deleteLandById, transferLandOwnership, getLandHistory, acceptPurchaseRequest,}; 
=======
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
>>>>>>> f770ea13b91d0b2e6ffea6ec0136dee18710ee81
