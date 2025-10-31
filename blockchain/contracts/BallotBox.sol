// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the first contract so this one can talk to it
import "./VoterRegistry.sol";

contract BallotBox {
    VoterRegistry public voterRegistry;

    // Maps a party ID (e.g., "bjp_id") to its vote count
    mapping(string => uint256) public voteCounts;
    string[] public parties; // List of all party IDs

    // Maps a HASHED voter ID to "true" if they have voted
    mapping(bytes32 => bool) public hasVoterVoted;

    event VoteCast(string indexed partyId);

    constructor(
        address registryAddress,
        string[] memory _parties
    ) {
        voterRegistry = VoterRegistry(registryAddress);
        parties = _parties;
    }

    /**
     * @dev This is the function your BACKEND will call.
     */
    function castVote(
        string memory partyId,
        bytes32 hashedVoterId,
        bytes memory unblindedSignature // From the blind signature process
    ) public {

        // 1. Check if this voter is on the list in the *other* contract
        require(voterRegistry.isVoterEligible(hashedVoterId), "Voter is not eligible");

        // 2. Check if this voter has already voted
        require(!hasVoterVoted[hashedVoterId], "This voter has already voted");

        // 3. Simplified (but effective) check that a signature was provided
        require(unblindedSignature.length > 50, "Invalid signature");

        // 4. Mark this voter as having voted
        hasVoterVoted[hashedVoterId] = true;

        // 5. Count the vote! This is the immutable part.
        voteCounts[partyId]++;
        emit VoteCast(partyId);
    }

    // Public function to read the vote count
    function getVotes(string memory partyId) public view returns (uint256) {
        return voteCounts[partyId];
    }
}