require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks:{
    sepolia:{
      url:"https://sepolia.infura.io/v3/cdb55ae0ec5e46a68ec5ade50357377a",
      accounts:["3c16b0f39feaf27878f79a62c424d0434adc5237d4716188d4b29071d618ef3c"],
      
    }
  }
};
