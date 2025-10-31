// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ImmutableVoting {
    struct Voter {
        string aadhaarHash;
        string encryptedName;
        string encryptedEmail;
        address walletAddress;
        uint256 registrationTime;
        bool isActive;
    }

    struct Vote {
        uint256 electionId;
        bytes32 voteHash;
        uint256 timestamp;
        bytes32 blindSignature;
        string partyId;  // Store actual party ID as string
    }

    struct Election {
        uint256 id;
        string name;
        uint256 startTime;
        uint256 endTime;
        bool active;
        string[] parties;
        uint256 totalVotes;
    }

    mapping(address => Voter) public voters;
    mapping(bytes32 => Vote) public votes;
    mapping(uint256 => Election) public elections;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    address[] public voterAddresses;
    bytes32[] public voteHashes;
    uint256[] public electionIds;

    event VoterRegistered(address indexed voter, bytes32 aadhaarHash, uint256 timestamp);
    event VoteCast(bytes32 indexed voteHash, uint256 indexed electionId, uint256 timestamp);
    event ElectionCreated(uint256 indexed electionId, string name);

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerVoter(
        address voterAddress,
        string memory aadhaarHash,
        string memory encryptedName,
        string memory encryptedEmail
    ) external onlyAdmin {
        require(bytes(voters[voterAddress].aadhaarHash).length == 0, "Voter already registered");

        voters[voterAddress] = Voter({
            aadhaarHash: aadhaarHash,
            encryptedName: encryptedName,
            encryptedEmail: encryptedEmail,
            walletAddress: voterAddress,
            registrationTime: block.timestamp,
            isActive: true
        });

        voterAddresses.push(voterAddress);
        emit VoterRegistered(voterAddress, bytes32(bytes(aadhaarHash)), block.timestamp);
    }

    function createElection(
        uint256 electionId,
        string memory name,
        uint256 startTime,
        uint256 endTime,
        string[] memory partyIds,
        string[] memory partyNames
    ) external onlyAdmin {
        require(elections[electionId].id == 0, "Election already exists");

        Election storage newElection = elections[electionId];
        newElection.id = electionId;
        newElection.name = name;
        newElection.startTime = startTime;
        newElection.endTime = endTime;
        newElection.active = true;
        newElection.parties = partyNames;

        electionIds.push(electionId);
        emit ElectionCreated(electionId, name);
    }

    function castVote(
        uint256 electionId,
        bytes32 voteHash,
        bytes32 blindSignature,
        string memory partyId
    ) external {
        require(bytes(voters[msg.sender].aadhaarHash).length > 0, "Voter not registered");
        require(voters[msg.sender].isActive, "Voter not active");
        require(elections[electionId].active, "Election not active");
        require(!hasVoted[msg.sender][electionId], "Already voted in this election");
        require(votes[voteHash].timestamp == 0, "Vote hash already used");

        votes[voteHash] = Vote({
            electionId: electionId,
            voteHash: voteHash,
            timestamp: block.timestamp,
            blindSignature: blindSignature,
            partyId: partyId
        });

        voteHashes.push(voteHash);
        hasVoted[msg.sender][electionId] = true;
        elections[electionId].totalVotes++;

        emit VoteCast(voteHash, electionId, block.timestamp);
    }

    function getVoter(address voterAddress) external view returns (Voter memory) {
        return voters[voterAddress];
    }

    function getVote(bytes32 voteHash) external view returns (Vote memory) {
        return votes[voteHash];
    }

    function getElection(uint256 electionId) external view returns (
        uint256 id,
        string memory name,
        uint256 startTime,
        uint256 endTime,
        bool active,
        string[] memory parties,
        uint256 totalVotes
    ) {
        Election storage election = elections[electionId];
        return (
            election.id,
            election.name,
            election.startTime,
            election.endTime,
            election.active,
            election.parties,
            election.totalVotes
        );
    }

    function getTotalVoters() external view returns (uint256) {
        return voterAddresses.length;
    }

    function getTotalVotes() external view returns (uint256) {
        return voteHashes.length;
    }

    function deactivateVoter(address voterAddress) external onlyAdmin {
        voters[voterAddress].isActive = false;
    }

    function endElection(uint256 electionId) external onlyAdmin {
        elections[electionId].active = false;
    }
}