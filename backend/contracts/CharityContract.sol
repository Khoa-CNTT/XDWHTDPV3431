// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CharityContract is Ownable, ReentrancyGuard {
    struct Need {
        string title;
        string description;
        address creator;
        uint256 targetAmount;
        uint256 raisedAmount;
        bool isActive;
        uint256 createdAt;
    }

    mapping(uint256 => Need) public needs;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    uint256 public needCount;

    event NeedCreated(uint256 indexed needId, address indexed creator, string title, uint256 targetAmount);
    event ContributionMade(uint256 indexed needId, address indexed contributor, uint256 amount);
    event NeedCompleted(uint256 indexed needId, uint256 totalRaised);

    constructor() {
        needCount = 0;
    }

    function createNeed(
        string memory _title,
        string memory _description,
        uint256 _targetAmount
    ) public returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        
        uint256 needId = needCount;
        needs[needId] = Need({
            title: _title,
            description: _description,
            creator: msg.sender,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        needCount++;
        emit NeedCreated(needId, msg.sender, _title, _targetAmount);
        return needId;
    }

    function contribute(uint256 _needId) public payable nonReentrant {
        require(_needId < needCount, "Invalid need ID");
        require(needs[_needId].isActive, "Need is not active");
        require(msg.value > 0, "Contribution amount must be greater than 0");
        
        Need storage need = needs[_needId];
        require(need.raisedAmount + msg.value <= need.targetAmount, "Target amount exceeded");
        
        contributions[_needId][msg.sender] += msg.value;
        need.raisedAmount += msg.value;
        
        emit ContributionMade(_needId, msg.sender, msg.value);
        
        if (need.raisedAmount >= need.targetAmount) {
            need.isActive = false;
            emit NeedCompleted(_needId, need.raisedAmount);
        }
    }

    function getNeedDetails(uint256 _needId) public view returns (
        string memory title,
        string memory description,
        address creator,
        uint256 targetAmount,
        uint256 raisedAmount,
        bool isActive,
        uint256 createdAt
    ) {
        require(_needId < needCount, "Invalid need ID");
        Need storage need = needs[_needId];
        return (
            need.title,
            need.description,
            need.creator,
            need.targetAmount,
            need.raisedAmount,
            need.isActive,
            need.createdAt
        );
    }

    function getNeedCount() public view returns (uint256) {
        return needCount;
    }

    function getNeedIds() public view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](needCount);
        for (uint256 i = 0; i < needCount; i++) {
            ids[i] = i;
        }
        return ids;
    }

    function withdrawFunds(uint256 _needId) public nonReentrant {
        require(_needId < needCount, "Invalid need ID");
        Need storage need = needs[_needId];
        require(msg.sender == need.creator, "Only creator can withdraw");
        require(!need.isActive, "Need is still active");
        
        uint256 amount = need.raisedAmount;
        need.raisedAmount = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
} 