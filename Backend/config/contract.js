// backend/config/contract.js
const ethers = require('ethers');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(`${process.env.ALCHEMY_API_KEY}`);
const wallet = new ethers.Wallet(process.env.YOUR_WALLET_PRIVATE_KEY, provider);
const landRegistryAddress = process.env.YOUR_DEPLOYED_CONTRACT_ADDRESS;
const landRegistryABI = require('../../Blockchain/artifacts/contracts/LandRegistry.sol/LandRegistry.json').abi;
const landRegistry = new ethers.Contract(landRegistryAddress, landRegistryABI, wallet);


module.exports = { landRegistry };