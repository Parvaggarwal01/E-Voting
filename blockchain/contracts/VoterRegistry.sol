// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VoterRegistry {
    address public electionCommissioner;
    mapping(bytes32 => bool) public isVoterRegistered;
    event VoterAdded(bytes32 indexed hashedVoterId);

    constructor() {
        electionCommissioner = msg.sender;
    }

    modifier onlyEC() {
        require(msg.sender == electionCommissioner, "Only EC can call this");
        _;
    }

    // Called by your backend to register a voter
    function registerVoter(bytes32 hashedVoterId) public onlyEC {
        require(!isVoterRegistered[hashedVoterId], "Voter already registered");
        isVoterRegistered[hashedVoterId] = true;
        emit VoterAdded(hashedVoterId);
    }

    // Publicly checks if a voter is eligible
    function isVoterEligible(bytes32 hashedVoterId) public view returns (bool) {
        return isVoterRegistered[hashedVoterId];
    }
}