// backend/models/land.js
const mongoose = require('mongoose');
const  landSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  landArea: { type: Number, required: true },
  district: { type: String, required: true },
  taluk: { type: String, required: true },
  village: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  surveyNumber: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  landId: { type: String, required: true, unique: true }, // Add landId field
  registrationDate: { type: String },
  status: { type: String, default: "not verified" },
  purchaseRequests: [
    {
      buyerAddress: { type: String, required: true },
      buyerName: { type: String, required: true },
      status: { type: String, default: "pending" }, // pending, accepted, rejected
      timestamp: { type: Date, default: Date.now },
    },
  ],
});



const Land = mongoose.model("Land", landSchema);
module.exports = Land;