# Purpose

It allows you to compile and migrate a [Solidity](https://solidity.readthedocs.io/en/v0.4.21/index.html) in to a running [Parity](https://www.parity.io/) node.

# Motivation

`parity-toolbox` address cases when you want to contracts in a certain (programmable) sequence.
Here is an example: let's presume `ContractB` needs some information from `ContractA` to be deployed.
For such situations you was forced to introduce a thrid contract that manage the migration, or to addapt
the migration scripts. Both solutions introduce extra code which is somehow not business relevant.  
With `parity-toolbox` you can deploy `ContractA`, call a method on `ContractA` and then use the results to
deploy `ContractB`.


It also supports deployment for contract with constructors with arguments. 


This is not a replacement for the [truffle suite](https://truffleframework.com/) it is rather complementary to it.


# Usage

This project is publish as [npm](https://www.npmjs.com/) package under the name 
[parity-toolbox](https://www.npmjs.com/package/parity-toolbox).
In order to use it  you need to import it by adding it as dependencies to your
npm project with the command: `install parity-toolbox --save`
or with yarn with command: `yarn install parity-toolbox`.
Alternative you can add the dependency by your own to the
[package.json](./package.json).


Until now the web3-toolbox has two releases (1.xx and 2.xx).


## parity-toolbox-1.xx

This version provides a single functionality, the deploy.  

The `deploy` functionality can be described with  with three arguments:
`the path to the solidity contract` (file) to be deployed,
`the parity account responsible for the contract` and `the URL` for your parity node.
Consider the next example as well, or the [example.js](./example.js).

```javascript
const contractFile = "./test/contract.sol";
const account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
const nodeURL = "http://localhost:8545";
const toolbox = require('./ParityToolbox');
toolbox.deploy(contractFile, account, nodeURL);
```
> Note: your parity node must be stated with the `unlock` option for the given
account, otherwise you need to use the parity UI to confirm the transaction
related with the migration. 
Consider [this stackexchange entry](https://ethereum.stackexchange.com/questions/15467/custom-parity-signer-programmatically-unlock-accounts-for-a-certain-time) for more details.
For more details about parity setup consider also the `Paritiy setup section`.

The `deploy` method does:
1. It compiles the contract (something similar with `solc --optimize --abi --bin --metadata YOUR_CONTRACT.sol`)
2. It asks the parity node how much Gas is needed for to migrate given contract.
3. It uses the gas value to migrate the contract in to the given parity node.

All this query for gas and the migration are done over the parity JSON-RPC api.
For more details consider [this article](https://wiki.parity.io/Smart-Contracts)
as well.

If the deploy is successful then a deploy report with following syntax is generated. 

```javascript
{transactionHash: '0x...', 
 account: '0x0..', 
 gas:'1' }
```

Where:
* transactionHash - is the hash for the transaction, you can use it to obtain the entire transaction
* account - the contract owner
* gas: the ammount of gas used to deploy the contract.

### parity-toolbox-1.xx limitations

The moment parity-toolbox-1.xx can deploy only one contract once.
You can deploy only contracts with parameter less constructors. 

This problems are solved with version 2.xx.


## parity-toolbox-2.xx


With version two the deploy is done in a similar way with the 1.xx version, the main differences are:
support for constructors with arguments and the [promise handling](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Promise) approach.  
Here is an usage example:

```javascript
const contractFile = "./test/contract.sol";
// this is the default parity developement account (not for production)
const account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
const nodeURL = "http://localhost:8545";
const toolbox = require('./index.js');

toolbox.deployToURL(contractFile, account, nodeURL).then((contractInstance) => {console.log(contractInstance);});
```
Consider the [deploy.js file](https://github.com/norgoci/parity-toolbox/blob/master/deploy.js) as well.

The `deployToURL` returns a promise that encapsulates a contract instance for your solidity file.
You can use this to call methods on the deployed contract, consider the next code snippet.

```javascript
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
```

Consider the [deploy.js file](https://github.com/norgoci/parity-toolbox/blob/master/deployandrun.js) as well.

 
The deployToURL supports following arguments: 

1. `contractFile` - the path to the solidity file to be deployed, it must be provided.
2. `account` - the contract owner address, it must be provided.
3. `nodeURL` - the URL for the chain node where the contract will be deployed, by default is `http://localhost:8545`
4. `args` - the arguments for the contract constructor, by default an empty array.
5. `gasPrice` - the gas price to be used for deploy, by default `30000000000000`


## Source Code

The source code is hosted [here](https://github.com/norgoci/parity-toolbox).

If you find a bug or you need a new feature don't be shy and create a new issue git lab issue for it.

## API Documentation

The api is can be gnerated with command `jsdoc index.js -d api-docs` or the `get-apidocs.bash` script.
This requires [jsdocs](https://www.npmjs.com/package/jsdoc).


## Release log

For more information about the version and features consider the [CHANGE-LOG.md](https://github.com/norgoci/parity-toolbox/blob/master/CHANGE-LOG.md)
