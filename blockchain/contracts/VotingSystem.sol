// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VotingSystem {
    address public admin;
    uint256 public voterCount;
    uint256 public voteCount;

    struct Voter {
        string aadhaarHash;
        string encryptedName;
        string encryptedEmail;
        address walletAddress;
        uint256 registrationTime;
        bool isActive;
        bool isRegistered;
    }

    struct Vote {
        uint256 voteId;
        bytes32 voteHash;
        string electionId;  // UUID string
        string partyId;     // UUID string
        uint256 timestamp;
        bytes32 blindSignature;
    }

    // Mappings
    mapping(address => Voter) public voters;
    mapping(bytes32 => bool) public isVoterRegistered; // aadhaar hash -> bool
    mapping(address => bool) public voterExists;
    mapping(bytes32 => Vote) public votes; // voteHash -> Vote
    mapping(uint256 => bytes32) public voteHashes; // voteId -> voteHash
    mapping(address => mapping(string => bool)) public hasVoted; // voter -> electionId -> bool

    // Arrays for iteration
    address[] public voterAddresses;

    // Events
    event VoterRegistered(address indexed voterAddress, string aadhaarHash);
    event VoteCast(bytes32 indexed voteHash, string electionId, string partyId);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    constructor() {
        admin = msg.sender;
        voterCount = 0;
        voteCount = 0;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    // Voter Registration
    function registerVoter(
        address voterAddress,
        string memory aadhaarHash,
        string memory encryptedName,
        string memory encryptedEmail
    ) external onlyAdmin {
        bytes32 aadhaarHashBytes = keccak256(abi.encodePacked(aadhaarHash));

        require(!isVoterRegistered[aadhaarHashBytes], "Voter already registered with this Aadhaar");
        require(!voterExists[voterAddress], "Voter already registered with this address");
        require(bytes(aadhaarHash).length > 0, "Aadhaar hash cannot be empty");

        voters[voterAddress] = Voter({
            aadhaarHash: aadhaarHash,
            encryptedName: encryptedName,
            encryptedEmail: encryptedEmail,
            walletAddress: voterAddress,
            registrationTime: block.timestamp,
            isActive: true,
            isRegistered: true
        });

        isVoterRegistered[aadhaarHashBytes] = true;
        voterExists[voterAddress] = true;
        voterAddresses.push(voterAddress);
        voterCount++;

        emit VoterRegistered(voterAddress, aadhaarHash);
    }

    // Vote Casting
    function castVote(
        bytes32 voteHash,
        string memory electionId,
        string memory partyId,
        bytes32 blindSignature
    ) external {
        require(voterExists[msg.sender], "Voter not registered");
        require(voters[msg.sender].isActive, "Voter not active");
        require(!hasVoted[msg.sender][electionId], "Already voted in this election");
        require(votes[voteHash].timestamp == 0, "Vote hash already used");
        require(bytes(electionId).length > 0, "Election ID cannot be empty");
        require(bytes(partyId).length > 0, "Party ID cannot be empty");

        voteCount++;

        votes[voteHash] = Vote({
            voteId: voteCount,
            voteHash: voteHash,
            electionId: electionId,
            partyId: partyId,
            timestamp: block.timestamp,
            blindSignature: blindSignature
        });

        voteHashes[voteCount] = voteHash;
        hasVoted[msg.sender][electionId] = true;

        emit VoteCast(voteHash, electionId, partyId);
    }

    // Getter Functions for Statistics
    function getVoter(address voterAddress) external view returns (Voter memory) {
        require(voterExists[voterAddress], "Voter does not exist");
        return voters[voterAddress];
    }

    function getVote(uint256 voteId) external view returns (Vote memory) {
        require(voteId > 0 && voteId <= voteCount, "Invalid vote ID");
        bytes32 voteHash = voteHashes[voteId];
        return votes[voteHash];
    }

    function getAllVoterAddresses() external view returns (address[] memory) {
        return voterAddresses;
    }

    function isVoterEligible(bytes32 hashedVoterId) external view returns (bool) {
        return isVoterRegistered[hashedVoterId];
    }

    // Admin Functions
    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminChanged(oldAdmin, newAdmin);
    }

    function deactivateVoter(address voterAddress) external onlyAdmin {
        require(voterExists[voterAddress], "Voter does not exist");
        voters[voterAddress].isActive = false;
    }

    function activateVoter(address voterAddress) external onlyAdmin {
        require(voterExists[voterAddress], "Voter does not exist");
        voters[voterAddress].isActive = true;
    }

    // View function to check if voter has voted in specific election
    function hasVoterVoted(address voterAddress, string memory electionId) external view returns (bool) {
        return hasVoted[voterAddress][electionId];
    }
}