// controllers/authController.js
const User = require('../models/user'); // Add this import

async function checkWallet(req, res) {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false,
        message: "Wallet address is required"
      });
    }

    // First check if it's the hardcoded admin wallet
    const isHardcodedAdmin = process.env.ADMIN_WALLET && 
      walletAddress.toLowerCase() === process.env.ADMIN_WALLET.toLowerCase();

    // Then check database
    const user = await User.findOne({ 
      walletAddress: { $regex: new RegExp(walletAddress, 'i') } 
    });

    const isAdmin = isHardcodedAdmin || (user && user.role === 'admin');

    if (!user && !isHardcodedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Wallet not authorized",
        isAuthorized: false
      });
    }

    return res.status(200).json({
      success: true,
      isAuthorized: true,
      isAdmin,
      user: {
        name: user?.name || (isAdmin ? "Admin User" : "User"),
        email: user?.email || (isAdmin ? "admin@smartland.com" : ""),
        role: isAdmin ? 'admin' : user?.role || 'user'
      }
    });
  } catch (error) {
    console.error("Wallet check error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

module.exports = { checkWallet }; // Export as CommonJS