const User = require("../models/user");

async function handleGetAllUsers(req, res) {
    const allusers = await User.find({});
    return res.json(allusers);
}

async function handleGetUserById(req, res) {    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "user not found" });
    return res.json(user);
}

async function handleUpdateUserById(req, res) {
    const updateData = {};
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.walletAddress) updateData.walletAddress = req.body.walletAddress;
    if (req.body.name) updateData.name = req.body.name;

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    );
    
    if (!updatedUser) return res.status(404).json({ error: "user not found" });
    return res.json({ status: "success", user: updatedUser });
}

async function handleCreateNewUser(req, res) {
    const body = req.body;
    console.log(body);
    
    // Check all required fields including walletAddress
    if (!body || !body.name || !body.email || !body.walletAddress) {
        return res.status(400).json({ 
            error: "Name, email, and walletAddress are required" 
        });
    }

    // Create user object with all required fields
    const userData = {
        name: body.name,
        email: body.email,
        walletAddress: body.walletAddress
    };

    try {
        const result = await User.create(userData);
        console.log("result", result);
        return res.status(201).json({ 
            msg: "success", 
            id: result._id 
        });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ 
                error: "Email or wallet address already exists" 
            });
        }
        return res.status(500).json({ 
            error: "Server error",
            details: error.message 
        });
    }
}

module.exports = {
    handleGetAllUsers,
    handleGetUserById,
    handleUpdateUserById,
    handleCreateNewUser
};