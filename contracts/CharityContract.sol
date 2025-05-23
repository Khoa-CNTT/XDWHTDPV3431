// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityContract {
    struct Need {
        uint256 id;
        string title;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        address creator;
        bool isActive;
        uint256 createdAt;
    }

    struct Contribution {
        uint256 needId;
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Need) public needs;
    mapping(uint256 => Contribution[]) public contributions;
    uint256 public needCount;

    event NeedCreated(uint256 indexed needId, string title, uint256 targetAmount);
    event ContributionMade(uint256 indexed needId, address indexed contributor, uint256 amount);
    event NeedCompleted(uint256 indexed needId);

    function createNeed(string memory _title, string memory _description, uint256 _targetAmount) public {
        needCount++;
        needs[needCount] = Need({
            id: needCount,
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            currentAmount: 0,
            creator: msg.sender,
            isActive: true,
            createdAt: block.timestamp
        });
        emit NeedCreated(needCount, _title, _targetAmount);
    }

    function contribute(uint256 _needId) public payable {
        require(_needId > 0 && _needId <= needCount, "Invalid need ID");
        require(needs[_needId].isActive, "Need is not active");
        require(msg.value > 0, "Contribution amount must be greater than 0");

        needs[_needId].currentAmount += msg.value;
        contributions[_needId].push(Contribution({
            needId: _needId,
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit ContributionMade(_needId, msg.sender, msg.value);

        if (needs[_needId].currentAmount >= needs[_needId].targetAmount) {
            needs[_needId].isActive = false;
            emit NeedCompleted(_needId);
        }
    }

    function getNeed(uint256 _needId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 targetAmount,
        uint256 currentAmount,
        address creator,
        bool isActive,
        uint256 createdAt
    ) {
        Need memory need = needs[_needId];
        return (
            need.id,
            need.title,
            need.description,
            need.targetAmount,
            need.currentAmount,
            need.creator,
            need.isActive,
            need.createdAt
        );
    }

    function getContributions(uint256 _needId) public view returns (Contribution[] memory) {
        return contributions[_needId];
    }
} 