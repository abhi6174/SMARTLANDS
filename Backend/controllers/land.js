const Land = require('../models/land');
const ethers = require('ethers');
const { landRegistry } = require('../config/contract');
let landDetails;

// Update the landRegisteredAbi to match your contract's event
const landRegisteredAbi = [
  "event LandRegistered(bytes32 indexed landId, address indexed owner, string ownerName, string documentHash, uint256 price)"
];
const iface = new ethers.Interface(landRegisteredAbi);

const decodeLandRegisteredEvent = (log) => {
  try {
    const decodedLog = iface.parseLog(log);
    if (!decodedLog) {
      console.warn("Failed to decode log:", log);
      return null;
    }
    return {
      landId: decodedLog.args.landId,
      owner: decodedLog.args.owner,
      ownerName: decodedLog.args.ownerName,
      documentHash: decodedLog.args.documentHash
    };
  } catch (error) {
    console.error("Error decoding log:", error);
    return null;
  }
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
      let landDetails = await landRegistry.lands(decodedEvent.landId);
      console.log("lan",landDetails)
      // Exclude lands owned by the current user
      if (landDetails.ownerAddress.toLowerCase() !== owner.toLowerCase()) {
        marketplaceLands.push({
          landId: decodedEvent.landId.toString(),
          ownerName: landDetails.ownerName,
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
    })}};

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
        documentHash: landDetails.documentHash,
        price:landDetails.price.toString(),
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

    // Convert BigInt values to strings before sending response
    const serializedLands = lands.map(land => ({
      ...land,
      landArea: land.landArea.toString(),
      blockNumber: land.blockNumber.toString(),
      surveyNumber: land.surveyNumber.toString(),
      price: land.price.toString() // Convert price to string
    }));

    res.status(200).json({ 
      success: true,
      data: serializedLands || []
    });
  } catch (error) {
    console.error("Error fetching lands:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch lands",
      data: []
    });
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
  const { landId, buyerAddress, buyerName, message } = req.body;

  try {
    // Validate input
    if (!landId || !buyerAddress || !buyerName) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields" 
      });
    }

    const land = await Land.findOne({ landId });
    if (!land) {
      return res.status(404).json({ 
        success: false,
        error: "Land not found" 
      });
    }

    // Check for existing request
    const existingRequest = land.purchaseRequests.find(
      request => request.buyerAddress.toLowerCase() === buyerAddress.toLowerCase()
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: "You already have a pending request for this land",
      });
    }

    // Add new request with timestamp
    land.purchaseRequests.push({ 
      buyerAddress, 
      buyerName,
      message: message || "",
      status: "pending",
      timestamp: new Date()
    });

    await land.save();

    res.status(200).json({ 
      success: true,
      message: "Purchase request sent successfully",
      land 
    });
  } catch (error) {
    console.error("Error adding purchase request:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send purchase request",
      details: error.message 
    });
  }
};
const getNonVerifiedLands = async (req, res) => {
  try {
    console.log("Fetching non-verified lands...");
    const dbLands = await Land.find({ status: "Pending" });
    
    res.status(200).json({ 
      success: true,
      data: dbLands.map(land => land.toObject())
    });
  } catch (error) {
    console.error("Error in getNonVerifiedLands:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch pending lands",
      details: error.message 
    });
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
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve land" 
    });
  }
};

// Register a new land
const createLand = async (req, res) => {
  const { ownerName, landArea, district, taluk, village, blockNumber, surveyNumber, walletAddress,documentHash,inclandId,price } = req.body;
  
  try {
    // Validate all required fields including price
    if (!ownerName || !landArea || !district || !taluk || !village || 
        !blockNumber || !surveyNumber || !walletAddress || !documentHash || !price) {
      return res.status(400).json({ error: "All fields including price are required" });
    }

    const landId = ethers.solidityPackedKeccak256(
      ["uint256", "string", "string", "string", "uint256", "uint256"],
      [landArea, district, taluk, village, blockNumber, surveyNumber]
    );
    if (inclandId && inclandId !== landId) {
      console.log("Land IDs don't match");
      return res.status(400).json({ error: "Invalid land ID" });
    }
    // Check if a land with this documentHash already exists
    const existingLand = await Land.findOne({ documentHash });
    if (existingLand) {
      return res.status(400).json({ 
        success: false,
        error: "A land with this document already exists" 
      });
    }
    const newLand = new Land({ownerName,landArea,district,taluk,village,blockNumber,surveyNumber,walletAddress,documentHash,price, landId,status: "Pending"});

    await newLand.save();

    res.status(201).json({ 
      success: true,
      message: "Land registration submitted for approval",
      land: newLand
    });

  } catch (error) {
    console.error("Error adding land:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to submit land registration" 
    });
  }
};

// Update land by ID
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

// Delete land by ID
const deleteLandById = async (req, res) => {
  try {
    const deletedLand = await Land.findByIdAndDelete(req.params.id);
    if (!deletedLand) {
      return res.status(404).json({ error: "Land not found" });
    }
    res.status(200).json({ message: "Land record deleted", deletedLand });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: "Failed to delete land record" 
    });
  }
};

// Transfer land ownership
const transferLandOwnership = async (req, res) => {
  const { landId, buyerAddress, buyerName, txHash, price } = req.body;

  try {
    // Validate input
    if (!landId || !buyerAddress || !buyerName) {
      return res.status(400).json({ 
        success: false,
        error: "Land ID, buyer address, and buyer name are required." 
      });
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction hash format"
      });
    }

    // Fetch and validate land
    const land = await Land.findOne({ landId });
    if (!land) {
      return res.status(404).json({ 
        success: false,
        error: "Land not found" 
      });
    }


    // Update land record
    land.walletAddress = buyerAddress.toLowerCase();
    land.ownerName = buyerName;
    land.status = "Sold";
    land.txHash = txHash;
    land.price = price; // Store final price
    land.transferDate = new Date();
    
    // Remove all purchase requests for this buyer
    land.purchaseRequests = land.purchaseRequests.filter(
      request => request.buyerAddress.toLowerCase() !== buyerAddress.toLowerCase()
    );

    await land.save();

    res.status(200).json({ 
      success: true,
      message: "Ownership transferred successfully",
      data: {
        landId: land.landId,
        newOwner: buyerAddress,
        txHash: txHash
      }
    });
  } catch (error) {
    console.error("Transfer error:", {
      message: error.message,
      body: req.body,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: error.message
    });
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
    res.status(500).json({ 
      success: false,
      error: "Failed to accept purchase request" 
    });
  }
};


const verifyLand = async (req, res) => {
  try {
    const { landId, action, adminComments, isBlockchain, txHash } = req.body;
    const land = await Land.findOne({ landId });

    if (!land) {
      return res.status(404).json({ error: "Land not found" });
    }

    if (action === 'approve') {
      land.status = "Verified";
      land.adminComments = adminComments;
      land.verificationDate = new Date();
      
      if (isBlockchain && txHash) {
        land.blockchainVerified = true;
        land.txHash = txHash;
      }

      await land.save();
      
      return res.json({ 
        success: true,
        message: "Land approved" + (isBlockchain ? " (blockchain)" : "")
      });
    } else {
      // Rejection logic
      land.status = "Rejected";
      land.adminComments = adminComments;
      await land.save();
      
      return res.json({ success: true, message: "Land rejected" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
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
  verifyLand,
  getLandsForPayment,
  getNonVerifiedLands,
  getLandById,
  createLand,
  updateLandById,
  deleteLandById,
  transferLandOwnership,
  acceptPurchaseRequest

};

