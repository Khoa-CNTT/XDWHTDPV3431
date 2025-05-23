const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          process.env.ETHEREUM_PRIVATE_KEY,
          process.env.ETHEREUM_NODE_URL
        ),
      network_id: 11155111,
      gas: 2000000,
      gasPrice: 10000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      networkCheckTimeout: 10000,
      skipDryRun: true,
      websockets: true
    }
  },
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};