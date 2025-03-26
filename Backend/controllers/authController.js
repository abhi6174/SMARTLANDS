const User = require('../models/user');

exports.checkWallet = async (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false,
        message: "Wallet address is required"
      });
    }

    // Case-insensitive comparison with admin wallet
    const isAdmin = walletAddress && process.env.ADMIN_WALLET 
      ? walletAddress.toLowerCase() === process.env.ADMIN_WALLET.toLowerCase().trim()
      : false;

    // Check regular users in database
    const user = await User.findOne({ 
      walletAddress: { $regex: new RegExp(walletAddress, 'i') } 
    });

    if (!user && !isAdmin) {
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
};