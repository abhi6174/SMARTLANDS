const User = require('../models/user');

const adminCheck = async (req, res, next) => {
  try {
    const walletAddress = req.headers['wallet-address'];
    if (!walletAddress) {
      return res.status(401).json({ 
        success: false,
        error: "Wallet address required"
       });
    }

    // Check both environment variable and database for admin
    const user = await User.findOne({ 
      walletAddress: { $regex: new RegExp(walletAddress, 'i') },
      role: 'admin'
    });

    if (!user) {
      return res.status(403).json({ 
        success: false,
        error: "Admin access denied" 
      });
    }

    req.user = user; // Attach admin user to request
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error during admin verification" 
    });
  }
};

module.exports = adminCheck;