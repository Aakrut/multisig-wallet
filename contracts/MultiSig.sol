// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract MultiSig {
    address[] public owners;
    uint public transactionCount;
    uint public required;

    struct Transaction {
        address destination;
        uint value;
        bool executed;
       
    }

    mapping(uint => Transaction) public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    constructor(address[] memory _owners, uint _confirmations) {
        require(_owners.length > 0);
        require(_confirmations > 0);
        require(_confirmations <= _owners.length);
        owners = _owners;
        required = _confirmations;
    }

    function isOwner(address _addr) public view returns(bool) {
        for(uint i=0 ;i<owners.length ;i++) {
            if(owners[i] == _addr) {
                return true;
            }
        }
        return false;
    }


    function addTransaction(address _destination,uint _value) public  returns(uint) {
        transactions[transactionCount] =     Transaction(_destination,_value,false);
        transactionCount+=1;
        return transactionCount -1;
    }

    function confirmTransaction(uint _transactionId) public {
        require(isOwner(msg.sender));
        confirmations[_transactionId][msg.sender] = true;
    }

    function getConfirmationsCount(uint _transactionId) public view returns(uint) {
        uint count;
        for(uint i=0;i < owners.length;i++) {
            if(confirmations[_transactionId][owners[i]]) {
                count ++;
            }
        }
        return count;
    }

    receive() external payable {}
}
