pragma solidity ^0.4.21;


contract ContractB {

    uint private solution;
    string private msg;

    constructor(uint _solution, string _msg) public {
        solution = _solution;
        msg = _msg;
    }

    function getSolution() public returns (uint) {
        return solution;
    }

    function getMsg() public returns (string) {
        return msg;
    }
}
