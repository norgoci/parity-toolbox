pragma solidity ^0.4.21;


contract Solution {

    uint private solution;
    address public owner;

    constructor(uint _solution) public {
        owner = msg.sender;
        solution = _solution;
    }

    modifier onlyOwnerAllowed() {
        require(msg.sender == owner);
        _;
    }

    function getSolution() public returns (uint) {
       return solution;
    }

    function getOtherSolution() public  returns (uint) {
        return 42;
    }
}
