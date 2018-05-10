# Purpose

It allows you to compile and migrate a [Solidity](https://solidity.readthedocs.io/en/v0.4.21/index.html) in to a running [Parity](https://www.parity.io/) node.

# Motivation

I want to be able to deploy my solidity contracts on parity node automatic,
(e.g. triggered any change in the contract). I try to use
[truffle suite](http://truffleframework.com/) but the process froze and after
I do a little bit of research I figure it out that parity has an API for this.
I choose nodeJS/javascript because most of my project are nodeJS based.

I still use truffle suite for the development and I use the toolbox only for
deployment on parity.

# Usage

Import it by adding this as dependencies to your project with npm with the
command: `install parity-toolbox --save`
or with yarn with command: `yarn install parity-toolbox`.

Once install you can use it by calling the `deploy` with three arguments:
the path to the solidity file to be deployed,
the parity account responsible for the contract and the URL for your parity node.
Consider the next example as well.

```javascript
let contractFile = "./test/contract.sol";
let account = "0x00a329c0648769a73afac7f9381e08fb43dbea72";
let nodeURL = "http://localhost:8545";
let toolbox = require('./ParityToolbox');
toolbox.deploy(contractFile, account, nodeURL);
```

> Note: your parity node must be stated with the `unlock` option for the given
account, otherwise you need to use the parity UI to confirm the transaction
related with the migration. Consider [this stackexchange entry](https://ethereum.stackexchange.com/questions/15467/custom-parity-signer-programmatically-unlock-accounts-for-a-certain-time) for more details.

## Logic behind the functionality

The deploy method does:
1. compiles the contract (something similar with `solc --optimize --abi --bin --metadata YOUR_CONTRACT.sol`)
2. asks the parity node how much Gas is needed for to migrate given contract.
3. uses the gas value to migrate the contract in to the given parity node.

All this query for gas and the migration are done over the parity JSON-RPC api.
For more details consider [this article](https://wiki.parity.io/Smart-Contracts)
as well.


## Usage Locally

If you have a local installed parity then you can start it with the command
`parity --chain dev` or by using the (start-parity.bash)[./start-parity.bash] script.
After this run from an other terminal `npm start`, this will execute the
[index.ts](./index.ts) which will deploy the contract [contract.sol](./test/contract.sol)
in the local parity instance.

if everything runs well you must be able to see in the  terminal where you
invoke `npm start` a similar output:

```bash
npm start                                               17:01:35  4.60G 

> parity-toolbox@1.0.0 start /imaginarium/lab0/norg0ci.pr0jects/parity-toolbox
> node index.js

The conrtact 0x8f79ea98d36a0232c87c024df7ee23bfe8cb25617e06021a57c560554c745145 was deployed and it cost 0x37766 gas

```

Output that indicates the amount of gas and your contract address.


# Limitations (that far)

For the moment you can deploy only one contract and no dependencies on other
contracts are supported.
This features will be added asap.
