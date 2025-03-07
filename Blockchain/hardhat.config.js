require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks:{
    sepolia:{
      url:process.env.ALCHEMYURL,
      accounts:[process.env.USER1KEY],
      chainId: 80002
    }
  }
};
