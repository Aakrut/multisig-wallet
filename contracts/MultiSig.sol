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
        bytes data;
    }

    mapping(uint => Transaction) public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    function getConfirmationsCount(uint transactionId) public view returns(uint) {
        uint count;
        for(uint i = 0; i < owners.length; i++) {
            if(confirmations[transactionId][owners[i]]) {
                count++;
            }
        }
        return count;
    }

    function isOwner(address _addr) public view returns(bool) {
        for(uint i=0 ;i<owners.length ;i++) {
            if(owners[i] == _addr) {
                return true;
            }
        }
        return false;
    }

    function confirmTransaction(uint transactionId) public  {
        require(isOwner(msg.sender));
        confirmations[transactionId][msg.sender] = true;
        if(isConfirmed(transactionId)) {
            executeTransaction(transactionId);
        }
    }

    function addTransaction(address destination, uint value,bytes memory data) internal returns(uint) {
        transactions[transactionCount] = Transaction(destination, value,false, data);
        transactionCount += 1;
        return transactionCount - 1;
    }

    function submitTransaction(address _destination,uint _value,bytes memory _data) external {
        uint id = addTransaction(_destination,_value,_data);
        confirmTransaction(id);
    }

    function isConfirmed(uint _transactionId) public view returns(bool){
      return getConfirmationsCount(_transactionId) >= required;
    }

    function executeTransaction(uint _transactionId) public {
        require(isConfirmed(_transactionId));
        Transaction storage _tx = transactions[_transactionId];
        (bool success,) = _tx.destination.call{value:_tx.value}(_tx.data);
        require(success,"Failed to Execute Transaction");
        _tx.executed = true;
    }

    constructor(address[] memory _owners, uint _confirmations) {
        require(_owners.length > 0);
        require(_confirmations > 0);
        require(_confirmations <= _owners.length);
        owners = _owners;
        required = _confirmations;
    }

    receive() external payable {}
}
