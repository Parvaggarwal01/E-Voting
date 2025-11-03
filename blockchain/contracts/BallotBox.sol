// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoterRegistry.sol";

contract BallotBox {
    VoterRegistry public voterRegistry;
    mapping(string => uint256) public voteCounts;
    string[] public parties;
    mapping(bytes32 => bool) public hasVoterVoted;
    uint256 public totalVotesCast; // <-- NEW LINE

    event VoteCast(string indexed partyId);

    constructor(
        address registryAddress,
        string[] memory _parties
    ) {
        voterRegistry = VoterRegistry(registryAddress);
        parties = _parties;
    }

    function castVote(
        string memory partyId,
        bytes32 hashedVoterId,
        bytes memory unblindedSignature
    ) public {
        require(voterRegistry.isVoterEligible(hashedVoterId), "Voter is not eligible");
        require(!hasVoterVoted[hashedVoterId], "This voter has already voted");
        require(unblindedSignature.length > 50, "Invalid signature");

        hasVoterVoted[hashedVoterId] = true;
        voteCounts[partyId]++;
        totalVotesCast++; // <-- NEW LINE
        emit VoteCast(partyId);
    }

    function getVotes(string memory partyId) public view returns (uint256) {
        return voteCounts[partyId];
    }
}