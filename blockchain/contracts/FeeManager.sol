// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CampToken.sol"; // ✅ Make sure the path is correct

contract FeeManager {
    CampToken public campToken;

    struct Payment {
        uint256 amount;
        bool isPaid;
        uint256 timestamp;
    }

    mapping(address => Payment) public studentPayments;

    event FeesPaid(address indexed student, uint256 amount);

    constructor(address _campToken) {
        campToken = CampToken(_campToken);
    }

    function payFees(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(campToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        studentPayments[msg.sender] = Payment(amount, true, block.timestamp);
        emit FeesPaid(msg.sender, amount);
    }

    function getPaymentStatus(address student) external view returns (bool, uint256) {
        Payment memory payment = studentPayments[student];
        return (payment.isPaid, payment.amount);
    }
}
