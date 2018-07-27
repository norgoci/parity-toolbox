const solc = require('solc')
const fs = require('fs');
const Web3 = require('web3');

function estimateGas(web3, abi, bytecode, args = []) {

  if (!web3) {
    reject(new Error('The web3 argument is not valid.'));
  }

  if (!abi) {
    reject(new Error('The abi argument is not valid.'));
  }

  if (!bytecode) {
    reject(new Error('The bytecode argument is not valid.'));
  }

  const contract = new web3.eth.Contract(abi);
  return contract.deploy({data: '0x' + bytecode, arguments: args}).estimateGas();
}

function migrate(web3, abi, bytecode, args, account, gas = 1500000, gasPrice = '30000000000000') {

  if (!web3) {
    throw new Error('The web3 argument is not valid.');
  }

  if (!bytecode) {
    throw new Error('The bytecode argument is not valid.');
  }

  if (!args) {
    throw new Error('The bytecode argument is not valid.');
  }

  if (!account) {
    throw new Error('The account argument is not valid.');
  }

  if (!web3) {
    throw new Error('The web3 argument is not valid.');
  }

  const contract = new web3.eth.Contract(abi);
  return contract.deploy({
    data: '0x' + bytecode,
    arguments: args,
  }).send({
      from: account,
      gas: gas,
      gasPrice: gasPrice
    })
}

exports.deployToWeb3 = function (solFile, account, web3, nodeURL, args = [], gasPrice = '30000000000000') {
  return new Promise(function (resolve, reject) {
    if (!solFile) {
      reject(new Error('The solFile argument is not valid.'));
    }

    if (!account) {
      reject(new Error('The account argument is not valid.'));
    }

    if (!nodeURL) {
      reject(new Error('The nodeURL argument is not valid.'));
    }

    if (!args) {
      throw new Error('The args argument can not be undefined');
    }

    if (!Array.isArray(args)) {
      throw new Error('The args argument MUST be an array.');
    }

    fs.readFile(solFile, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      const output = solc.compile(data, 1);
      const contractKey = Object.keys(output.contracts)[0];
      const contract = output.contracts[contractKey];
      const bytecode = contract.bytecode;
      if (!bytecode) {
        reject(new Error('The solidity file can not be compiled.'))
      }
      const abi = JSON.parse(contract.interface);

      estimateGas(web3, abi, bytecode, args, nodeURL)
        .then(function (error, gas) {
          resolve(migrate(web3, abi, bytecode, args, account, gas, gasPrice));
        }).catch(function (error) {
          reject(error);
        });
    });
  });
}

exports.buildWeb3 = function buildWeb3(web3URL) {
  if (web3URL.startsWith('http')) {
    return new Web3(new Web3.providers.HttpProvider(web3URL));
  }

  if (web3URL.startsWith('ws')) {
    return new Web3(new Web3.providers.WebsocketProvider(web3URL));
  }

  throw new Error('Protocol not supported for URL:' + web3URL);
}

exports.deployToURL = function (solFile, account, nodeURL, args = [], gasPrice = '30000000000000') {
  return exports.deployToWeb3(solFile, account, exports.buildWeb3(nodeURL), nodeURL, args, gasPrice);
}
