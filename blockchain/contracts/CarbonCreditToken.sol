// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditToken is ERC20, Ownable {
    struct RetirementRecord {
        uint256 amount;
        string reason;
        uint256 timestamp;
    }

    mapping(address => bool) public approvedMinters;
    mapping(address => RetirementRecord[]) public retirementHistory;

    event CreditsMinted(
        address indexed recipient,
        uint256 amount,
        string projectId
    );

    event CreditsRetired(
        address indexed account,
        uint256 amount,
        string reason
    );

    modifier onlyMinter() {
        require(
            approvedMinters[msg.sender] || owner() == msg.sender,
            "Not authorized to mint"
        );
        _;
    }

    constructor(
        address initialOwner
    ) ERC20("Carbon MRV Credit", "CMRV") Ownable(initialOwner) {}

    function approveMinter(
        address minter
    ) external onlyOwner {
        approvedMinters[minter] = true;
    }

    function revokeMinter(
        address minter
    ) external onlyOwner {
        approvedMinters[minter] = false;
    }

    function mintCredits(
        address recipient,
        uint256 amount,
        string memory projectId
    ) external onlyMinter {
        _mint(recipient, amount);

        emit CreditsMinted(
            recipient,
            amount,
            projectId
        );
    }

    function retireCredits(
        uint256 amount,
        string memory reason
    ) external {
        require(
            balanceOf(msg.sender) >= amount,
            "Insufficient balance"
        );

        _burn(msg.sender, amount);

        retirementHistory[msg.sender].push(
            RetirementRecord({
                amount: amount,
                reason: reason,
                timestamp: block.timestamp
            })
        );

        emit CreditsRetired(
            msg.sender,
            amount,
            reason
        );
    }

    function getRetirementHistory(
        address account
    ) external view returns (
        RetirementRecord[] memory
    ) {
        return retirementHistory[account];
    }
}