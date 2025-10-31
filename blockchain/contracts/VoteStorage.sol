// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VoteStorage {
    struct Voter {
        address voterAddress;
        bytes32 aadhaarHash;
        string encryptedName;
        string encryptedEmail;
        uint256 registrationTime;
        bool isActive;
    }

    struct Vote {
        bytes32 voteHash;
        string electionId;        // Database election ID (UUID)
        bytes32 blindSignature;
        string partyId;          // Database party ID (UUID)
        uint256 timestamp;
    }

    mapping(address => Voter) public voters;
    mapping(uint256 => Vote) public votes;

    address[] public voterAddresses;
    uint256 public voterCount;
    uint256 public voteCount;

    address public admin;

    event VoterRegistered(address indexed voterAddress, bytes32 aadhaarHash);
    event VoteCast(uint256 indexed voteId, string electionId, string partyId);

    constructor() {
        admin = msg.sender;
        voterCount = 0;
        voteCount = 0;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isActive, "Voter not registered or inactive");
        _;
    }

    // Register a new voter
    function registerVoter(
        address _voterAddress,
        bytes32 _aadhaarHash,
        string memory _encryptedName,
        string memory _encryptedEmail
    ) public onlyAdmin {
        require(!voters[_voterAddress].isActive, "Voter already registered");

        voters[_voterAddress] = Voter({
            voterAddress: _voterAddress,
            aadhaarHash: _aadhaarHash,
            encryptedName: _encryptedName,
            encryptedEmail: _encryptedEmail,
            registrationTime: block.timestamp,
            isActive: true
        });

        voterAddresses.push(_voterAddress);
        voterCount++;

        emit VoterRegistered(_voterAddress, _aadhaarHash);
    }

    // Cast a vote (only admin can submit votes as proxy for voters)
    function castVote(
        string memory _electionId,
        bytes32 _voteHash,
        bytes32 _blindSignature,
        string memory _partyId
    ) public onlyAdmin returns (uint256) {
        voteCount++;

        votes[voteCount] = Vote({
            voteHash: _voteHash,
            electionId: _electionId,
            blindSignature: _blindSignature,
            partyId: _partyId,
            timestamp: block.timestamp
        });

        emit VoteCast(voteCount, _electionId, _partyId);

        return voteCount;
    }

    // Get voter details
    function getVoter(address _voterAddress) public view returns (
        address voterAddress,
        bytes32 aadhaarHash,
        string memory encryptedName,
        string memory encryptedEmail,
        uint256 registrationTime,
        bool isActive
    ) {
        Voter memory voter = voters[_voterAddress];
        return (
            voter.voterAddress,
            voter.aadhaarHash,
            voter.encryptedName,
            voter.encryptedEmail,
            voter.registrationTime,
            voter.isActive
        );
    }

    // Get vote details
    function getVote(uint256 _voteId) public view returns (
        bytes32 voteHash,
        string memory electionId,
        bytes32 blindSignature,
        string memory partyId,
        uint256 timestamp
    ) {
        require(_voteId > 0 && _voteId <= voteCount, "Invalid vote ID");
        Vote memory vote = votes[_voteId];
        return (
            vote.voteHash,
            vote.electionId,
            vote.blindSignature,
            vote.partyId,
            vote.timestamp
        );
    }

    // Get all voter addresses
    function getAllVoterAddresses() public view returns (address[] memory) {
        return voterAddresses;
    }

    // Get votes for a specific election
    function getVotesForElection(string memory _electionId) public view returns (uint256[] memory) {
        uint256[] memory electionVotes = new uint256[](voteCount);
        uint256 count = 0;

        for (uint256 i = 1; i <= voteCount; i++) {
            if (keccak256(bytes(votes[i].electionId)) == keccak256(bytes(_electionId))) {
                electionVotes[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = electionVotes[i];
        }

        return result;
    }
}