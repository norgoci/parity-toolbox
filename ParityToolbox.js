const solc = require('solc')
const fs = require('fs');
const request = require('request');

/**
 * Builds a JSON used to query parity about the ammount
 * of gas required to deploy a contract from a given address.
 * @param {String} bytecode the compiled contract bytecode.
 * @param {String} the address for the user that deployes the contract.
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

function estimateGas(bytecode, account, nodeURL, useGas) {

  if (!bytecode) {
    console.error("The bytecode argument is not valid.");
    return;
  }

  if (!account) {
    console.error("The account argument is not valid.");
    return;
  }

  if (!nodeURL) {
    console.error("The nodeURL argument is not valid.");
    return;
  }

  let estimateGas = estimateGasQuery(bytecode, account);
  request.post({
    url: nodeURL,
    json: estimateGas
  }, function (err, httpResponse, body) {

    if (err) {
      // leave the process by error
      console.error(err);
      throw err
    }

    let gas = body.result;
    if (useGas && typeof useGas === 'function') {
      useGas(bytecode, gas, account, nodeURL);
    }
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

var migrate = function (bytecode, gas, account, nodeURL) {

  if (!bytecode) {
    console.error("The bytecode argument is not valid.");
    return;
  }

  if (!gas) {
    console.error("The gas argument is not valid.");
    return;
  }

  if (!account) {
    console.error("The account argument is not valid.");
    return;
  }

  if (!nodeURL) {
    console.error("The nodeURL argument is not valid.");
    return;
  }

  let query = migrateQuery(bytecode, gas, account);
  request.post({
    url: nodeURL,
    json: query
  }, function (err, httpResponse, body) {

    if (err) {
      console.error(err);
      throw err
      return;
    }
    // console.log(httpResponse);
    let transactionHash = body.result
    if (!transactionHash) {
      console.error("The conract was not deployed.");
      throw "The conract was not deployed.";
    }
    console.log("The contract was deployed with transaction %s and it cost %s gas", transactionHash, gas);
    let report = {transactionHash: transactionHash, gas: gas, account: account};
    let fs = require('fs');
    fs.writeFile('deploy-report.json', JSON.stringify(report), (err) => {
      if (err) throw err;
    });
  });
}

exports.deploy = function (solFile, account, nodeURL) {

  if (!solFile) {
    console.error("File to compile found");
    return 1;
  }

  if (!account) {
    console.error("The contract account argument is invalid.");
    return 1;
  }

  if (!nodeURL) {
    console.error("The node URL argument is invalid.");
    return 1;
  }

  fs.readFile(solFile, 'utf8', function (err, data) {

    if (err) {
      console.error(err);
      proces.exit(1);
    }

    let compiled = solc.compile(data, 1);
    let contractKey = Object.keys(compiled.contracts)[0];
    let bytecode = compiled.contracts[contractKey].bytecode;
    estimateGas(bytecode, account, nodeURL, migrate);
  });
}
