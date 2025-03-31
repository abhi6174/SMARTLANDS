const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  landArea: { type: Number, required: true },
  district: { type: String, required: true },
  taluk: { type: String, required: true },
  village: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  surveyNumber: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  documentHash: { type: String, required: true },
  landId: { type: String, required: true, unique: true },
  price: { type: Number, required: true }, // Added price field
  registrationDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Rejected', 'Sold'], 
    default: 'Pending'
  },
  verificationDate: { type: Date },
  adminComments: { type: String },
  blockchainVerified: { type: Boolean, default: false },
  txHash: {type:String},
  purchaseRequests: [
    {
      buyerAddress: { type: String, required: true },
      buyerName: { type: String, required: true },
      status: { type: String, default: "pending" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});
// In models/land.js
const Land = mongoose.model("Land", landSchema);
module.exports = Land;