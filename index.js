const toolbox = require('./ParityToolbox');

/**
 * Compiles and deploy the given contract file.
 *
 * @param contractFile {string} the path to the solidity file to be deploy
 * @param account {string} the account that will own the contract.
 * @param nodeURL {string} the node where the parity node accepsts incoming requests.
 */
exports.deployToURL = function(contractFile,
                               account,
                               nodeURL = 'http://localhost:8545',
                               args = [],
                               gasPrice = '30000000000000') {
  return toolbox.deployToURL(contractFile, account, nodeURL, args, gasPrice);
}

exports.deployToWeb3 = function(contractFile,
                                account,
                                web3,
                                nodeURL = 'http://localhost:8545',
                                args = [],
                                gasPrice = '30000000000000') {
  return toolbox.deployToWeb3(contractFile, account, web3, nodeURL, args, gasPrice);
}

exports.buildWeb3 = function(nodeURL = 'http://localhost:8545') {
  return toolbox.buildWeb3(nodeURL);
}
