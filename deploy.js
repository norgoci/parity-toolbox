const contractFile = "./test/contract_a.sol";
// this is the default parity developement account (not for production)
const account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
const nodeURL = "http://localhost:8545";
const toolbox = require('./index.js');

toolbox.deployToURL(contractFile, account, nodeURL).then((contractInstance) => {console.log(contractInstance);});

