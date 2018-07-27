const contractFile = "./test/contract_args.sol";
// this is the default parity developement account (not for production)
const account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
const nodeURL = "http://localhost:8545";
const toolbox = require('./index.js');

toolbox.deployToURL(contractFile, account, nodeURL, [42]).then((contractInstance) => {
  console.log('contract address:' + contractInstance.options.address);
  contractInstance.methods.getOtherSolution().call().then( function(solution) {console.log(solution);});
  contractInstance.methods.getSolution().call().then( function(solution) {console.log(solution);});
});