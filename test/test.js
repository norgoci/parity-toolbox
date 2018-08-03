const assert = require('assert');
const deployer = require('../index');
const ganache = require('ganache-cli');
const server = ganache.server();

describe('test deployer', function() {

  var account;

  before(async function() {
    server.listen(8545);
    const ganacheState = server.provider.manager.state;
    account = Object.keys(ganacheState.accounts)[0];
  });

  after(function() {
    server.close();
  });

  it('deploy and invoke contract', async function () {
    this.timeout(10000);
    const contractA = await deployer.deployToURL('./test/contract_a.sol', account);
    assert(contractA, 'The contract can not be undefined.');
    const solution = await contractA.methods.getSolution().call();
    assert.equal('42', solution, 'The contract answers with wrong value.');
  });

});
