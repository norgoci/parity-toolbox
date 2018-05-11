let contractFile = "./test/contract.sol";
// this is the default parity developement account (not for production)
let account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
// default paritiy port
let nodeURL = "http://localhost:8545";

var toolbox = require('parity-toolbox');
toolbox.deploy(contractFile, account, nodeURL);
