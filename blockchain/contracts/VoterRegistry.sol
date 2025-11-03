// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VoterRegistry {
    address public electionCommissioner;
    mapping(bytes32 => bool) public isVoterRegistered;
    uint256 public totalRegisteredVoters; // <-- NEW LINE

    event VoterAdded(bytes32 indexed hashedVoterId);

    constructor() {
        electionCommissioner = msg.sender;
    }

    modifier onlyEC() {
        require(msg.sender == electionCommissioner, "Only EC can call this");
        _;
    }

    function registerVoter(bytes32 hashedVoterId) public onlyEC {
        require(!isVoterRegistered[hashedVoterId], "Voter already registered");
        isVoterRegistered[hashedVoterId] = true;
        totalRegisteredVoters++; // <-- NEW LINE
        emit VoterAdded(hashedVoterId);
    }

    function isVoterEligible(bytes32 hashedVoterId) public view returns (bool) {
        return isVoterRegistered[hashedVoterId];
    }
}