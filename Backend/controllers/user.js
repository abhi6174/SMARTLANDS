const User = require("../models/user");

// Utility function for consistent error responses
const errorResponse = (res, status, message, error = null) => {
  const response = { success: false, error: message };
  if (error) response.details = error.message;
  return res.status(status).json(response);
};

const handleGetAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ 
      success: true, 
      data: users || [] // Ensure we always return an array
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch users",
      data: [] // Return empty array on error
    });
  }
};


const handleGetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    errorResponse(res, 500, "Failed to fetch user", error);
  }
};

const handleUpdateUserById = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.walletAddress) updateData.walletAddress = req.body.walletAddress;
    if (req.body.name) updateData.name = req.body.name;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedUser) return errorResponse(res, 404, "User not found");
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    errorResponse(res, 500, "Failed to update user", error);
  }
};

const handleCreateNewUser = async (req, res) => {
  try {
    const { name, email, walletAddress } = req.body;
    
    if (!name || !email || !walletAddress) {
      return errorResponse(res, 400, "Name, email, and walletAddress are required");
    }

    const user = await User.create({ name, email, walletAddress });
    res.status(201).json({ success: true, data: { id: user._id } });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, "Email or wallet address already exists");
    }
    errorResponse(res, 500, "Failed to create user", error);
  }
};

const handleDeleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return errorResponse(res, 404, "User not found");
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    errorResponse(res, 500, "Failed to delete user", error);
  }
};

const getAdminWallet = async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) return errorResponse(res, 404, "Admin user not found");
    res.status(200).json({ success: true, data: adminUser.walletAddress });
  } catch (error) {
    errorResponse(res, 500, "Failed to fetch admin wallet", error);
  }
};

const checkUserAuthorization = async (req, res) => {
  try {
    const { walletAddress } = req.query;
    const user = await User.findOne({ walletAddress });
    res.status(200).json({ 
      success: true,
      data: {
        isAuthorized: !!user,
        role: user?.role || null
      }
    });
  } catch (error) {
    errorResponse(res, 500, "Authorization check failed", error);
  }
};

module.exports = {
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleCreateNewUser,
  handleDeleteUser,
  getAdminWallet,
  checkUserAuthorization
};