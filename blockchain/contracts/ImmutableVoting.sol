// SPDX-License-Identifier: MIT// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;pragma solidity ^0.8.28;



contract ImmutableVoting {contract ImmutableVoting {

    address public admin;    struct Voter {

            string aadhaarHash;

    struct Voter {        string encryptedName;

        string aadhaarHash;        string encryptedEmail;

        string encryptedName;        address walletAddress;

        string encryptedEmail;        uint256 registrationTime;

        address walletAddress;        bool isActive;

        uint256 registrationTime;    }

        bool isActive;

    }    struct Vote {

            uint256 electionId;

    struct Election {        bytes32 voteHash;

        uint256 id;        uint256 timestamp;

        string name;        bytes32 blindSignature;

        uint256 startTime;        string partyId;  // Store actual party ID as string

        uint256 endTime;    }

        bool active;

        string[] parties;    struct Election {

        uint256 totalVotes;        uint256 id;

    }        string name;

            uint256 startTime;

    struct Vote {        uint256 endTime;

        uint256 electionId;        bool active;

        bytes32 voteHash;        string[] parties;

        uint256 timestamp;        uint256 totalVotes;

        bytes32 blindSignature;    }

        string partyId;

    }    mapping(address => Voter) public voters;

        mapping(bytes32 => Vote) public votes;

    mapping(address => Voter) public voters;    mapping(uint256 => Election) public elections;

    mapping(uint256 => Election) public elections;    mapping(address => mapping(uint256 => bool)) public hasVoted;

    mapping(bytes32 => Vote) public votes;

    mapping(address => mapping(uint256 => bool)) public hasVoted;    address[] public voterAddresses;

        bytes32[] public voteHashes;

    address[] public voterAddresses;    uint256[] public electionIds;

    uint256[] public electionIds;

    bytes32[] public voteHashes;    event VoterRegistered(address indexed voter, bytes32 aadhaarHash, uint256 timestamp);

        event VoteCast(bytes32 indexed voteHash, uint256 indexed electionId, uint256 timestamp);

    event VoterRegistered(address indexed voter, bytes32 aadhaarHash, uint256 timestamp);    event ElectionCreated(uint256 indexed electionId, string name);

    event ElectionCreated(uint256 indexed electionId, string name);

    event VoteCast(bytes32 indexed voteHash, uint256 indexed electionId, uint256 timestamp);    address public admin;



    constructor() {    modifier onlyAdmin() {

        admin = msg.sender;        require(msg.sender == admin, "Only admin can perform this action");

    }        _;

        }

    modifier onlyAdmin() {

        require(msg.sender == admin, "Only admin can call this function");    constructor() {

        _;        admin = msg.sender;

    }    }



    function registerVoter(    function registerVoter(

        address voterAddress,        address voterAddress,

        string memory aadhaarHash,        string memory aadhaarHash,

        string memory encryptedName,        string memory encryptedName,

        string memory encryptedEmail        string memory encryptedEmail

    ) public onlyAdmin {    ) external onlyAdmin {

        require(!voters[voterAddress].isActive, "Voter already registered");        require(bytes(voters[voterAddress].aadhaarHash).length == 0, "Voter already registered");



        voters[voterAddress] = Voter({        voters[voterAddress] = Voter({

            aadhaarHash: aadhaarHash,            aadhaarHash: aadhaarHash,

            encryptedName: encryptedName,            encryptedName: encryptedName,

            encryptedEmail: encryptedEmail,            encryptedEmail: encryptedEmail,

            walletAddress: voterAddress,            walletAddress: voterAddress,

            registrationTime: block.timestamp,            registrationTime: block.timestamp,

            isActive: true            isActive: true

        });        });



        voterAddresses.push(voterAddress);        voterAddresses.push(voterAddress);

                emit VoterRegistered(voterAddress, bytes32(bytes(aadhaarHash)), block.timestamp);

        emit VoterRegistered(voterAddress, keccak256(abi.encodePacked(aadhaarHash)), block.timestamp);    }

    }

        function createElection(

    function createElection(        uint256 electionId,

        uint256 electionId,        string memory name,

        string memory name,        uint256 startTime,

        uint256 startTime,        uint256 endTime,

        uint256 endTime,        string[] memory partyIds,

        string[] memory partyIds,        string[] memory partyNames

        string[] memory partyNames    ) external onlyAdmin {

    ) public onlyAdmin {        require(elections[electionId].id == 0, "Election already exists");

        require(elections[electionId].id == 0, "Election already exists");

        require(partyIds.length == partyNames.length, "Party IDs and names length mismatch");        Election storage newElection = elections[electionId];

        require(partyIds.length > 0, "At least one party required");        newElection.id = electionId;

                newElection.name = name;

        // Validate party ID lengths (UUIDs should be reasonable length)        newElection.startTime = startTime;

        for (uint i = 0; i < partyIds.length; i++) {        newElection.endTime = endTime;

            require(bytes(partyIds[i]).length > 0 && bytes(partyIds[i]).length <= 50, "Invalid party ID length");        newElection.active = true;

            require(bytes(partyNames[i]).length > 0, "Party name cannot be empty");        newElection.parties = partyNames;

        }

                electionIds.push(electionId);

        elections[electionId] = Election({        emit ElectionCreated(electionId, name);

            id: electionId,    }

            name: name,

            startTime: startTime,    function castVote(

            endTime: endTime,        uint256 electionId,

            active: true,        bytes32 voteHash,

            parties: partyIds,        bytes32 blindSignature,

            totalVotes: 0        string memory partyId

        });    ) external {

                require(bytes(voters[msg.sender].aadhaarHash).length > 0, "Voter not registered");

        electionIds.push(electionId);        require(voters[msg.sender].isActive, "Voter not active");

                require(elections[electionId].active, "Election not active");

        emit ElectionCreated(electionId, name);        require(!hasVoted[msg.sender][electionId], "Already voted in this election");

    }        require(votes[voteHash].timestamp == 0, "Vote hash already used");



    function castVote(        votes[voteHash] = Vote({

        uint256 electionId,            electionId: electionId,

        bytes32 voteHash,            voteHash: voteHash,

        bytes32 blindSignature,            timestamp: block.timestamp,

        string memory partyId            blindSignature: blindSignature,

    ) public onlyAdmin {            partyId: partyId

        require(elections[electionId].id != 0, "Election does not exist");        });

        require(elections[electionId].active, "Election is not active");

        require(votes[voteHash].electionId == 0, "Vote hash already used");        voteHashes.push(voteHash);

                hasVoted[msg.sender][electionId] = true;

        // Verify party exists in election        elections[electionId].totalVotes++;

        bool partyExists = false;

        string[] memory parties = elections[electionId].parties;        emit VoteCast(voteHash, electionId, block.timestamp);

        for (uint i = 0; i < parties.length; i++) {    }

            if (keccak256(abi.encodePacked(parties[i])) == keccak256(abi.encodePacked(partyId))) {

                partyExists = true;    function getVoter(address voterAddress) external view returns (Voter memory) {

                break;        return voters[voterAddress];

            }    }

        }

        require(partyExists, "Party not found in election");    function getVote(bytes32 voteHash) external view returns (Vote memory) {

                return votes[voteHash];

        votes[voteHash] = Vote({    }

            electionId: electionId,

            voteHash: voteHash,    function getElection(uint256 electionId) external view returns (

            timestamp: block.timestamp,        uint256 id,

            blindSignature: blindSignature,        string memory name,

            partyId: partyId        uint256 startTime,

        });        uint256 endTime,

                bool active,

        voteHashes.push(voteHash);        string[] memory parties,

        elections[electionId].totalVotes++;        uint256 totalVotes

            ) {

        emit VoteCast(voteHash, electionId, block.timestamp);        Election storage election = elections[electionId];

    }        return (

                election.id,

    function endElection(uint256 electionId) public onlyAdmin {            election.name,

        require(elections[electionId].id != 0, "Election does not exist");            election.startTime,

        elections[electionId].active = false;            election.endTime,

    }            election.active,

                election.parties,

    function deactivateVoter(address voterAddress) public onlyAdmin {            election.totalVotes

        require(voters[voterAddress].isActive, "Voter not active");        );

        voters[voterAddress].isActive = false;    }

    }

        function getTotalVoters() external view returns (uint256) {

    // View functions        return voterAddresses.length;

    function getElection(uint256 electionId) public view returns (    }

        uint256 id,

        string memory name,    function getTotalVotes() external view returns (uint256) {

        uint256 startTime,        return voteHashes.length;

        uint256 endTime,    }

        bool active,

        string[] memory parties,    function deactivateVoter(address voterAddress) external onlyAdmin {

        uint256 totalVotes        voters[voterAddress].isActive = false;

    ) {    }

        Election memory election = elections[electionId];

        return (    function endElection(uint256 electionId) external onlyAdmin {

            election.id,        elections[electionId].active = false;

            election.name,    }

            election.startTime,}
            election.endTime,
            election.active,
            election.parties,
            election.totalVotes
        );
    }

    function getVoter(address voterAddress) public view returns (Voter memory) {
        return voters[voterAddress];
    }

    function getVote(bytes32 voteHash) public view returns (Vote memory) {
        return votes[voteHash];
    }

    function getTotalVoters() public view returns (uint256) {
        return voterAddresses.length;
    }

    function getTotalVotes() public view returns (uint256) {
        return voteHashes.length;
    }
}