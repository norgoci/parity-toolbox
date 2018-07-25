const solc = require('solc')
const fs = require('fs');
const request = require('request');
const Web3 = require('web3');

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

      if (body.error) {
        reject(body.error);
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
        reject(new Error('The contract was not deployed.'));
      }

      resolve({transactionHash: transactionHash, gas: gas, account: account});
    });
  });
}

exports.deployToWeb3 = function (solFile, account, web3, nodeURL, args = []) {
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
      const bytecode = output.contracts[contractKey].bytecode;
      const abi = JSON.parse(output.contracts[contractKey].interface);
      const argsByteCode = encodeConstructorParams(web3, abi, args);
      const allBytecode = bytecode + argsByteCode;

      estimateGas(allBytecode, account, nodeURL)
        .then(function (gas) {
          return migrate(allBytecode, gas, account, nodeURL);
        })
        .then(function (deployRepot) {
          resolve(deployRepot);
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

exports.deployToURL = function (solFile, account, nodeURL, args = []) {
  return exports.deployToWeb3(solFile, account, exports.buildWeb3(nodeURL), nodeURL, args);
}

function getArgumentsType(abi, functionType, params) {

  if (!abi) {
    throw new Error('The abi argument can not be undefined');
  }

  if (!functionType) {
    throw new Error('The functionType argument can not be undefined');
  }

  if (!params) {
    throw new Error('The params argument can not be undefined');
  }

  if (!Array.isArray(params)) {
    throw new Error('The params argument MUST be an array.');
  }

  const result = abi.filter(function (json) {
    const length = json.inputs.length;
    const isConstructorType = json.type === functionType;
    const sameArgLength = length === params.length;
    return isConstructorType && sameArgLength;
  }).map(function (json) {
    return json.inputs.map(function (input) {
      return input.type;
    });
  });

  if (result.length != 1) {
    throw new Error('No constructor found for the given arguments');
  }

  return result[0];
};

function getConstructorArgumentsType(abi, params) {
  return getArgumentsType(abi, 'constructor', params);
}

function encodeConstructorParams(web3, abi, params) {
  const constructorArgumentsType = getConstructorArgumentsType(abi, params);
  const encodeParameters = web3.eth.abi.encodeParameters(constructorArgumentsType, params);
  const prefix = '0x';
  if (encodeParameters.startsWith(prefix)) {
    return encodeParameters.substr(prefix.length);
  }
  return encodeParameters;
}
