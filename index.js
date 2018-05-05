const solc = require('solc')
const fs = require('fs');


var askForGas = function (bytecode) {
  return "x22";
}

var migrate = function(bytecode, gas) {
  console.log("bytecode :" + bytecode);
  console.log("gas :" + gas);
}

fs.readFile('./contract.sol', 'utf8', function(err, data) {
  if (err) {
    console.error(err);
    proces.exit(1);
  }

  solc.loadRemoteVersion('latest', function(err, solcSnapshot) {
    if (err) {
      console.error(err);
      proces.exit(1);
    }
    let compiled = solcSnapshot.compile(data, 1);
    let bytecode = compiled.contracts[':Migrations'].bytecode;
    //console.log(bytecode);
    let gas = askForGas(bytecode);
    migrate(bytecode, gas);
  })
});
