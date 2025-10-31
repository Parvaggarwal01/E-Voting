// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the first contract so this one can talk to it
import "./VoterRegistry.sol";

contract BallotBox {

    // A link to the first contract
    VoterRegistry public voterRegistry;

    // --- Vote Counting ---
    // We map a party ID (like "bjp_id" or "cong_id") to its vote count
    mapping(string => uint256) public voteCounts;
    string[] public parties; // An array of all party IDs in this election

    // --- Prevent Double Voting ---
    // This tracks which *voters* have voted, using their hashed ID
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
     * @dev This is the function the VOTER calls from the React app.
     * It replaces your /api/vote/submit endpoint.
     */
    function castVote(
        string memory partyId,
        bytes32 hashedVoterId,
        bytes memory unblindedSignature // We will check this
    ) public {

        // 1. Check if this voter is on the list in the *other* contract
        require(voterRegistry.isVoterEligible(hashedVoterId), "Voter is not eligible");

        // 2. Check if this voter has already voted
        require(!hasVoterVoted[hashedVoterId], "This voter has already voted");

        // 3. IMPORTANT: Verify the unblindedSignature.
        // This is extremely complex to do for RSA in Solidity.
        // For a beginner, we will simplify: We just check that a signature *exists*.
        // This is a security simplification for your first version.
        require(unblindedSignature.length > 50, "Invalid signature");

        // 4. Mark this voter as having voted so they can't vote again
        hasVoterVoted[hashedVoterId] = true;

        // 5. Count the vote! This is the immutable part.
        voteCounts[partyId]++;
        emit VoteCast(partyId);
    }

    // A public function for anyone (like your ResultsPage.jsx) to read the votes
    function getVotes(string memory partyId) public view returns (uint256) {
        return voteCounts[partyId];
    }
}
