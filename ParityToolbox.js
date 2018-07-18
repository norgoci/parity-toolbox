const solc = require('solc')
const fs = require('fs');
const request = require('request');

/**
 * Builds a JSON used to query parity about the amount
 * of gas required to deploy a contract from a given address.
 * @param {String} bytecode the compiled contract bytecode.
 * @param {String} the address for the user that deploy the contract.
 */
function estimateGasQuery(bytecode, forAccount) {
  return {
    "jsonrpc": "2.0",
    "method": "eth_estimateGas",
    "params": [{
      "from": forAccount,
      "data": '0x' + bytecode
    }],
    "id": 1
  };
}

function estimateGas(bytecode, account, nodeURL) {
  return new Promise(function (resolve, reject) {
    if (!bytecode) {
      reject(new Error('The bytecode argument is not valid.'));
    }

    if (!account) {
      reject(new Error('The account argument is not valid.'));
    }

    if (!nodeURL) {
      reject(new Error('The nodeURL argument is not valid.'));
    }

    const estimateGas = estimateGasQuery(bytecode, account);
    request.post({
      url: nodeURL,
      json: estimateGas
    }, function (err, httpResponse, body) {

      if (err) {
        // leave the process by error
        reject(err);
      }
      resolve({bytecode: bytecode, gas: body.result, account: account, nodeURL: nodeURL});
    });
  });
}

function migrateQuery(bytecode, gas, account) {
  return {
    "method": "eth_sendTransaction",
    "params": [{
      "from": account,
      "gas": gas,
      "data": '0x' + bytecode
    }],
    "id": 1,
    "jsonrpc": "2.0"
  };
}

function migrate(bytecode, gas, account, nodeURL) {

  return new Promise(function (resolve, reject) {
    if (!bytecode) {
      reject(new Error('The bytecode argument is not valid.'));
    }

    if (!account) {
      reject(new Error('The account argument is not valid.'));
    }

    if (!nodeURL) {
      reject(new Error('The nodeURL argument is not valid.'));
    }

    const query = migrateQuery(bytecode, gas, account);
    request.post({
      url: nodeURL,
      json: query
    }, function (err, httpResponse, body) {

      if (err) {
        reject(err);
      }

      // console.log(httpResponse);
      let transactionHash = body.result
      if (!transactionHash) {
        reject(new Error('The conract was not deployed.'));
      }
      resolve({transactionHash: transactionHash, gas: gas, account: account});
    });
  });
}

exports.deploy = function (solFile, account, nodeURL) {

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

    fs.readFile(solFile, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }

      const compiled = solc.compile(data, 1);
      const contractKey = Object.keys(compiled.contracts)[0];
      const bytecode = compiled.contracts[contractKey].bytecode;
      resolve(estimateGas(bytecode, account, nodeURL)
        .then(migrate(bytecode, gas, account, nodeURL)));
    });

  });
}
