require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.10",
  mocha: {
    timeout: 100000000,
  },
  networks: {
    hardhat: {
      forking: {
        url: `${process.env.MAINNET}`,
        // blockNumber: 16867730,
      },
    },
    goerli: {
      url: `${process.env.TESTNET}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: `${process.env.ETHERSCANAPI}`,
  },
};
