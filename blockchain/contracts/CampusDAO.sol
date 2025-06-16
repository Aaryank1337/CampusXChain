// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CampToken.sol";

contract CampusDAO {
    CampToken public campToken;

    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool active;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;

    event ProposalCreated(uint256 proposalId, string description);
    event VoteCast(uint256 proposalId, address voter, bool support);

    constructor(address _campToken) {
        campToken = CampToken(_campToken);
    }

    function createProposal(string memory description, uint256 duration) external {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: description,
            yesVotes: 0,
            noVotes: 0,
            deadline: block.timestamp + duration,
            active: true
        });

        emit ProposalCreated(proposalCount, description);
    }

    function vote(uint256 proposalId, bool support) external {
        require(proposals[proposalId].active, "Proposal not active");
        require(block.timestamp < proposals[proposalId].deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(campToken.balanceOf(msg.sender) > 0, "Need CAMP tokens to vote");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposals[proposalId].yesVotes++;
        } else {
            proposals[proposalId].noVotes++;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function getProposal(uint256 proposalId) external view returns (
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 deadline,
        bool active
    ) {
        Proposal memory proposal = proposals[proposalId];
        return (proposal.description, proposal.yesVotes, proposal.noVotes, proposal.deadline, proposal.active);
    }
}
