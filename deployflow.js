const toolbox = require('parity-toolbox');
const account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
const nodeURL = "http://localhost:8545";

toolbox.deployToURL("./test/contract_a.sol", account, nodeURL).then((contractA) => {
  console.log('contract address:' + contractA.options.address);
  contractA.methods.getSolution().call().then( function(solution) {
    toolbox.deployToURL("./test/contract_b.sol", account, nodeURL, [solution])
    .then((contractB) => {
      console.log(contractB);
    });
  });
});
