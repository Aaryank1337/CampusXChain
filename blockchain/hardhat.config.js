require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    amoy: {
      url: process.env.ALCHEMY_AMOY_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002
    },
  },
};