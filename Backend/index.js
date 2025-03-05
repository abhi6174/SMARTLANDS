// backend/index.js
require('dotenv').config();
const express = require('express');
const userRouter = require("./routes/user");
const landRouter = require("./routes/land");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8001;
const { connectMongodb } = require("./connection");
const logReqRes = require("./middlewares");
const ethers = require('ethers');

// Sepolia provider via Alchemy
const provider = new ethers.JsonRpcProvider(`${process.env.INFURA_API_KEY}`);
const wallet = new ethers.Wallet(process.env.YOUR_WALLET_PRIVATE_KEY, provider); // Your wallet with test ETH
const landRegistryAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace after deployment
const landRegistryABI = require('../blockchain/artifacts/contracts/LandRegistry.sol/LandRegistry.json').abi;
const landRegistry = new ethers.Contract(landRegistryAddress, landRegistryABI, wallet);

connectMongodb("mongodb://127.0.0.1:27017/smartlands")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logReqRes("log.txt"));

app.use("/api/users", userRouter);
app.use("/api/lands", landRouter);

module.exports = { landRegistry };

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}..`);
});