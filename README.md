# Purpose

Its gives you a programmatic control upon the deploying process for [Solidity](https://solidity.readthedocs.io/en/v0.4.21/index.html) contracts.

Also, it  allows you to deploy contracts with arguments.

Initially this was build for [Parity](https://www.parity.io/) but in the meantime it can be used with any other Ethreum client.

# Motivation

Not all the deplyments scenarios follows the simple deploy scenario,
like single paramater less constructor contract;
a more elaborated usecase may involve scenerio where the contract deployment must
follow a certain flow.


Let's consider the following scenario: [ContractB](https://github.com/norgoci/parity-toolbox/blob/master/test/contract_b.sol)
depends on some runtime information generated by [ContractA](https://github.com/norgoci/parity-toolbox/blob/master/test/contract_a.sol)
and this information must be pass to `ContractB` over its constructor.

Under normal circumstances, you may introduce an extra contract able to deal with
the deployment flow or you will enrich the migration script for this.
Both this options introduce code that need to be maintained.

With `parity-toolbox`, you do not need this, you can script your deployment with
[promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
in the way that fits your need. Or more precisely with `parity-toolbox` you can deploy `ContractA`,
call a method on `ContractA` and then use the results to deploy `ContractB`. This case is described
in details in the `Parity-toolbox-2.xx` section.

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

```javascript
const contractFile = "./test/contract_args.sol";
// this is the default parity developement account (not for production)
const account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
const nodeURL = "http://localhost:8545";
const toolbox = require('parity-toolbox');

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
* `transactionHash` - is the hash for the transaction, you can use it to obtain the entire transaction
* `account` - the contract owner
* `gas` - the ammount of gas used to deploy the contract.

### parity-toolbox-1.xx limitations

The moment parity-toolbox-1.xx can deploy only one contract once.
You can deploy only contracts with parameter less constructors.

This problems are solved with version 2.xx.


## parity-toolbox-2.xx

Let's try to to solve following scenario:
[ContractB](https://github.com/norgoci/parity-toolbox/blob/master/test/contract_b.sol)
 depends on some runtime information generated by [ContractA](https://github.com/norgoci/parity-toolbox/blob/master/test/contract_a.sol),
more, this information is pass to `ContractB` over its constructor.
Here is the deploy flow with parity toolbox:

```javascript
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
      toolbox.deployToURL("./test/contract_b.sol", account, nodeURL, [solution, 'test'])
      .then((contractB) => {
        console.log('contract ' + contractBFile + ' was deployed on address:' + contractB.options.address);

        contractB.methods.getSolution().call().then( function(solution) {
          console.log('contract ' + contractBFile + ' solution = ' + solution);
        });

        contractB.methods.getMsg().call().then( function(msg) {
          console.log('contract ' + contractBFile + ' msg = ' + msg);
        });

      });
    });
});
```
This code snippet is available in the: [ContractB](https://github.com/norgoci/parity-toolbox/blob/master/test/deployflow.js)

If it is not obvious this code snnipet does:
1. compiles the `ContractA` and deploys it (before deployment a gas estimation for the deployment id occurs)
2. call the method `getSolution` on the ContractA contract instance
3. use this value to compile and deploy the `ContractB` (which has a constructor that accept two arguments).
4. calls `getSolution` on the `ContractB` instancev - this is the value provided over the constructor.
5. calls `getMsg` on the `ContractB` instance  - this is the value provided over the constructor.


## parity-toolbox-2.xx API 

With the version 2.xx provides two deploy methods, the `deployToURL` and `deployToWeb3`


The `deployToURL` creates its own [Web3](https://web3js.readthedocs.io/en/1.0/getting-started.html) instance for the given URL.
Use this method if you do not care about the web3 client. If you want to reuse an already existent web3 instance you may
 consider the `deployToWeb3` method.
 
Both methods returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that encapsulates a running copy for the deployed contract.


The `deployToURL` method supports following arguments:

1. `contractFile` - the path to the solidity file to be deployed, it must be provided.
2. `account` - the contract owner address, it must be provided.
3. `nodeURL` - the URL for the chain node where the contract will be deployed, by default is `http://localhost:8545`
4. `args` - the arguments for the contract constructor, by default an empty array.
5. `gasPrice` - the gas price to be used for deploy, by default `30000000000000`


The `deployToWeb3` is similar, the only difference is that you need to provide the web3 instance.

## Source Code

The source code is hosted [here](https://github.com/norgoci/parity-toolbox).

If you find a bug or you need a new feature don't be shy and create a new issue git lab issue for it.

## API Documentation

The api is can be gnerated with command `jsdoc index.js -d api-docs` or the `get-apidocs.bash` script.
This requires [jsdocs](https://www.npmjs.com/package/jsdoc).

## Release log

For more information about the version and features consider the [CHANGE-LOG.md](https://github.com/norgoci/parity-toolbox/blob/master/CHANGE-LOG.md)
