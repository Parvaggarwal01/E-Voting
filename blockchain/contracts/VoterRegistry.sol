
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VoterRegistry {
    // This is the wallet address of the EC (from MetaMask/Ganache)
    address public electionCommissioner;

    // This is the list of *hashed* voter IDs (e.g., hash of Aadhaar number)
    // We use a hash so we don't store personal info on the blockchain
    mapping(bytes32 => bool) public isVoterRegistered;

    event VoterAdded(bytes32 indexed hashedVoterId);

    constructor() {
        electionCommissioner = msg.sender; // The person who deploys this is the EC
    }

    // A modifier to make sure only the EC can add voters
    modifier onlyEC() {
        require(msg.sender == electionCommissioner, "Only EC can call this");
        _;
    }

    /**
     * @dev Called by your backend (admin.controller.js) during bulk registration.
     * This creates an immutable, public record that this voter is eligible.
     */
    function registerVoter(bytes32 hashedVoterId) public onlyEC {
        require(!isVoterRegistered[hashedVoterId], "Voter already registered");
        isVoterRegistered[hashedVoterId] = true;
        emit VoterAdded(hashedVoterId);
    }

    /**
     * @dev A public function anyone can use to check if a hash is on the list.
     */
    function isVoterEligible(bytes32 hashedVoterId) public view returns (bool) {
        return isVoterRegistered[hashedVoterId];
    }
}