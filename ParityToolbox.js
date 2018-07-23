const solc = require('solc')
const fs = require('fs');
const request = require('request');

/**
 * Builds a JSON used to query parity about the amount
 * of gas required to deploy a contract from a given address.
 *
 * @param  bytecode {string} the compiled contract bytecode.
 * @param forAccount {string} the address for the user that deploy the contract.
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

/**
 * Returns a promise able to deliver the amount of needed to deploy the given contract.
 *
 * @param bytecode {string} the compiled contract bytecode.
 * @param account {string} the address for the user that deploy the contract.
 * @param nodeURL {string} the node where the parity node accepsts incoming requests.
 * @return {Promise<any>} a promise able to deliver the amount of needed to deploy the given contract.
 */
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
      resolve(body.result);
    });
  });
}

/**
 * Builds a JSON used to deploy a contract in the given parity node.
 *
 * @param bytecode {string} the compiled contract bytecode.
 * @param account {string} the address for the user that deploy the contract.
 * @param nodeURL {string} the node where the parity node accepsts incoming requests.
 */
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

/**
 *
 * @param bytecode
 * @param gas
 * @param account
 * @param nodeURL
 * @return {Promise<any>}
 */
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
      estimateGas(bytecode, account, nodeURL)
        .then(function (gas) {
          return migrate(bytecode, gas, account, nodeURL);
        })
        .then(function (deployRepot) {
          resolve(deployRepot);
        }).catch(function (error) {
          reject(error);
        });
    });
  });
}
