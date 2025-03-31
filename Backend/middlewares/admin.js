const User = require('../models/user');

const adminCheck = async (req, res, next) => {
  
  try {
    const walletAddress = req.headers['wallet-address'];
    if (!walletAddress) {
      return res.status(401).json({ 
        success: false,
        error: "Wallet address required in headers" 
      });
    }

    // Check both environment variable and database for admin
    const isHardcodedAdmin = process.env.ADMIN_WALLET && 
      walletAddress.toLowerCase() === process.env.ADMIN_WALLET.toLowerCase();

    const user = await User.findOne({ 
      walletAddress: { $regex: new RegExp(walletAddress, 'i') }
    });

    if (!isHardcodedAdmin && (!user || user.role !== 'admin')) {
      return res.status(403).json({ 
        success: false,
        error: "Admin access denied. Not authorized." 
      });
    }

    req.user = user ;
    console.log("Admin check passed");
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error during admin verification",
      details: error.message 
    });
  }
};

module.exports = adminCheck;