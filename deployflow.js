const toolbox = require('./index.js');
const account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
const nodeURL = "http://localhost:8545";

const contractAFile = "./test/contract_a.sol";
const contractBFile = "./test/contract_b.sol";
toolbox.deployToURL(contractAFile, account, nodeURL)
  .then((contractA) => {
    console.log('contract ' + contractAFile + ' was deployed on address:' + contractA.options.address);
    contractA.methods.getSolution().call().then( function(solution) {
      console.log('contract ' + contractAFile + ' solution = ' + solution);
      toolbox.deployToURL("./test/contract_b.sol", account, nodeURL, [solution])
      .then((contractB) => {
        console.log('contract ' + contractBFile + ' was deployed on address:' + contractB.options.address);
        contractB.methods.getSolution().call().then( function(solution) {
          console.log('contract ' + contractBFile + ' solution = ' + solution);
        });
      });
    });
});
