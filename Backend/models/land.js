const mongoose = require('mongoose');

// Define schema & model
const landSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    trim: true,
    validate: {
        validator: function(v) {
            if (!v) return true; // Skip validation if empty (since it's not required)
            return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: props => `${props.value} is not a valid Ethereum wallet address!`
    }
},
  landArea: {
    type: Number,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  taluk: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
  blockNumber: {
    type: Number,
    required: true,
  },
  surveyNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  } 
});

const Land = mongoose.model("Land", landSchema);

module.exports = Land;  // Export the model properly
