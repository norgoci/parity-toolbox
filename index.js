exports.deploy = function(contractFile, account, nodeURL) {
  let toolbox = require('./ParityToolbox');
  toolbox.deploy(contractFile, account, nodeURL);
}
