const toolbox = require('./ParityToolbox');

/**
 * Compiles and deploy the given contract file.
 *
 * @param contractFile {string} the path to the solidity file to be deploy
 * @param account {string} the account that will own the contract.
 * @param nodeURL {string} the node where the parity node accepsts incoming requests.
 */
exports.deploy = function(contractFile, account, nodeURL) {
  return toolbox.deploy(contractFile, account, nodeURL);
}
