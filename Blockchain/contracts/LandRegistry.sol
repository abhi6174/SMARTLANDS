// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LandRegistry is Ownable {
    struct Land {
        string ownerName;
        uint256 landArea;
        string district;
        string taluk;
        string village;
        uint256 blockNumber;
        uint256 surveyNumber;
        address ownerAddress;
        bool exists;
        string documentHash; // Added document hash storage
    }

    mapping(bytes32 => Land) public lands;
    mapping(bytes32 => bool) public landExists;
    mapping(address => bytes32[]) public ownerLands; // Track lands by owner

    event LandRegistered(
        bytes32 indexed landId, 
        address indexed owner, 
        string ownerName,
        string documentHash 
    );
    event OwnershipTransferred(
        bytes32 indexed landId, 
        address indexed from, 
        address indexed to
    );
    event DocumentUpdated(bytes32 indexed landId, string newDocumentHash);

    constructor() Ownable(msg.sender) {}

    function registerLand(
        string memory _ownerName,
        uint256 _landArea,
        string memory _district,
        string memory _taluk,
        string memory _village,
        uint256 _blockNumber,
        uint256 _surveyNumber,
        string memory _documentHash // Added document hash parameter
    ) external {
        bytes32 landId = keccak256(
            abi.encodePacked(
                _landArea, 
                _district, 
                _taluk, 
                _village, 
                _blockNumber, 
                _surveyNumber
            )
        );
        
        require(!landExists[landId], "Land already registered");
        require(bytes(_documentHash).length > 0, "Document hash required");

        lands[landId] = Land({
            ownerName: _ownerName,
            landArea: _landArea,
            district: _district,
            taluk: _taluk,
            village: _village,
            blockNumber: _blockNumber,
            surveyNumber: _surveyNumber,
            ownerAddress: msg.sender,
            exists: true,
            documentHash: _documentHash
        });

        landExists[landId] = true;
        ownerLands[msg.sender].push(landId);

        emit LandRegistered(landId, msg.sender, _ownerName, _documentHash);
    }

    function transferOwnership(
        bytes32 _landId, 
        address _newOwner
    ) external payable {
        require(lands[_landId].exists, "Land does not exist");
        require(msg.sender == lands[_landId].ownerAddress, "Only owner can transfer");
        require(msg.value == 0.01 ether, "Must pay exactly 0.01 MATIC");

        // Update owner tracking
        _removeLandFromOwner(msg.sender, _landId);
        ownerLands[_newOwner].push(_landId);

        lands[_landId].ownerAddress = _newOwner;
        
        (bool sent, ) = msg.sender.call{value: 0.01 ether}("");
        require(sent, "Failed to send MATIC");

        emit OwnershipTransferred(_landId, msg.sender, _newOwner);
    }

    function updateDocumentHash(
        bytes32 _landId,
        string memory _newDocumentHash
    ) external {
        require(lands[_landId].exists, "Land does not exist");
        require(
            msg.sender == lands[_landId].ownerAddress || msg.sender == owner(),
            "Not authorized"
        );
        require(bytes(_newDocumentHash).length > 0, "Invalid document hash");

        lands[_landId].documentHash = _newDocumentHash;
        emit DocumentUpdated(_landId, _newDocumentHash);
    }

    function getLandsByOwner(address _owner) external view returns (bytes32[] memory) {
        return ownerLands[_owner];
    }

    function _removeLandFromOwner(address _owner, bytes32 _landId) private {
        bytes32[] storage landsArray = ownerLands[_owner];
        for (uint i = 0; i < landsArray.length; i++) {
            if (landsArray[i] == _landId) {
                landsArray[i] = landsArray[landsArray.length - 1];
                landsArray.pop();
                break;
            }
        }
    }

    // Added to support document hash in getLand function
    function getLand(bytes32 _landId) external view returns (
        string memory,
        uint256,
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        address,
        string memory
    ) {
        require(lands[_landId].exists, "Land does not exist");
        Land memory land = lands[_landId];
        return (
            land.ownerName,
            land.landArea,
            land.district,
            land.taluk,
            land.village,
            land.blockNumber,
            land.surveyNumber,
            land.ownerAddress,
            land.documentHash
        );
    }
}