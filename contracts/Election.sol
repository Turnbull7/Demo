pragma solidity ^0.5.0;

contract Election {
    // Model a position
    struct Position {
        uint id;
        string name;
    }

    // Model a Candidate
    struct Candidate {
        uint id;
        uint position;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;

    // Store Positions
    // Fetch Positions
    mapping(uint => Position) public positions;

    // Store Positions Count
    uint public positionsCount;

    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;

    // Store Candidates Count
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint[] indexed _candidateIds
    );

    constructor () public {
        addPosition("At-Large Representative");
        addCandidate("Julia Smith");
        addCandidate("Renett Clough");
        addCandidate("Brian McNeil");
        addCandidate("Guillaume Meyer");

        addPosition("Faith Based Representative");
        addCandidate("John M. Culpepper Jr.");

        addPosition("Parliamentarian");
        addCandidate("Kimmarie Johnson-Roussell");

        addPosition("Secretary");
        addCandidate("Tara Perry");

        addPosition("Vice President");
        addCandidate("Velma Vernice Stevens");
        addCandidate("Jessica Chow");

        addPosition("View Heights Resident Representative");
        addCandidate("Derrick Solomon");
        addCandidate("Carol Derby-David");
        addCandidate("Renee M. Dixon");

        addPosition("Youth/Educational Representative");
        addCandidate("Allan Caldwell");
        addCandidate("Audre Lopez King");
        addCandidate("Tiffany C. Zachery");
    }

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, positionsCount, _name, 0);
    }

    function addPosition (string memory _name) private {
        positionsCount ++;
        positions[positionsCount] = Position(positionsCount, _name);
    }

    function vote (uint[] memory _candidateIds) public {
        // require that they haven't voted before
        require(!voters[msg.sender], "Sender already voted");

        uint[] memory positionVoted = new uint[](positionsCount + 1);

        for (uint i = 0; i < _candidateIds.length; i++) {

            // require each candidate has a valid id
            require(_candidateIds[i] > 0 && _candidateIds[i] <= candidatesCount, "Invalid Candidate ID");

            // require only on candidate per position is selected
            require(positionVoted[candidates[_candidateIds[i]].position] != 1, "Only one vote allowed per position");
            //require(inArray(positionVoted, candidates[_candidateIds[i]].position));

            positionVoted[candidates[_candidateIds[i]].position] = 1;
        }

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        for (uint i = 0; i < _candidateIds.length; i++) {
            candidates[_candidateIds[i]].voteCount++;
        }

        // trigger voted event
        emit votedEvent(_candidateIds);
    }
}
