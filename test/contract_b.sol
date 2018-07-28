pragma solidity ^0.4.21;


contract Solution {

    uint private solution;

    constructor(uint _solution) public {
        solution = _solution;
    }

    function getSolution() public returns (uint) {
        return solution;
    }
}
