pragma solidity ^0.4.24;


contract ContractB {

    uint private solution;

    constructor(uint _solution) public {
        solution = _solution;
    }

    function getSolution() public returns (uint) {
       return solution + 1;
    }
}
