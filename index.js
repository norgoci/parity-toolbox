const toolbox = require('./ParityToolbox');

/**
 * Compiles and deploy the given contract file and returns a promise that
 * encapsulates a instance of deployed contract, use it to interact with the contract.
 * This method creates a web3 instance to interact with the contract.
 *
 * @param contractFile {string} the path to the solidity file to be deploy
 * @param account {string} the account that will own the contract.
 * @param nodeURL {string} the blockchain node where the the contract will be deployed.
 * By default is http://localhost:8545.
 * @param args the arguments for the contract constructor, by default is an empty array.
 * @param gas {number} the ammount of gas to be use for deploy, if is not defined then the gas will be evaluated.
 * @param gasPrice {string} the gas price used to deploy the contract.
 */
exports.deployToURL = function(contractFile,
                               account,
                               nodeURL = 'http://localhost:8545',
                               args = [],
                               gas,
                               gasPrice = '30000000000000') {
  return toolbox.deployToURL(contractFile, account, nodeURL, args, gas, gasPrice);
}

/**
 * Compiles and deploy the given contract file and returns a promise that
 * encapsulates a instance of deployed contract, use it to interact with the contract.
 *
 * @param contractFile {string} the path to the solidity file to be deploy
 * @param account {string} the account that will own the contract.
 * @param web3  the web3 instance used to interact with the chain.
 * @param nodeURL {string} the blockchain node where the the contract will be deployed.
 * By default is http://localhost:8545.
 * @param args the arguments for the contract constructor, by default is an empty array.
 * @param gas {number} the ammount of gas to be use for deploy, if is not defined then the gas will be evaluated.
 * @param gasPrice {string} the gas price used to deploy the contract.
 */
exports.deployToWeb3 = function(contractFile,
                                account,
                                web3,
                                nodeURL = 'http://localhost:8545',
                                args = [],
                                gas,
                                gasPrice = '30000000000000') {
  return toolbox.deployToWeb3(contractFile, account, web3, nodeURL, args, gas, gasPrice);
}

/**
 * Builds a web3 instance for a given URL.
 *
 * @param nodeURL the URL for the node to connect to.
 * @returns {*} the  web3 instance for a given URL.
 */
exports.buildWeb3 = function(nodeURL = 'http://localhost:8545') {
  return toolbox.buildWeb3(nodeURL);
}
