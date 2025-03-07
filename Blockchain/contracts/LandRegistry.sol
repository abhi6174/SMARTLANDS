// blockchain/contracts/LandRegistry.sol
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
    }

    mapping(bytes32 => Land) public lands; // Land ID is a Keccak hash
    mapping(bytes32 => bool) public landExists; // Track registered hashes

    event LandRegistered(bytes32 indexed landId, address indexed owner, string ownerName);
    event OwnershipTransferred(bytes32 indexed landId, address indexed from, address indexed to);
    event Debug(bytes32 landId); // Add this event for debugging

    constructor() Ownable(msg.sender) {}

    function registerLand(
        string memory _ownerName,
        uint256 _landArea,
        string memory _district,
        string memory _taluk,
        string memory _village,
        uint256 _blockNumber,
        uint256 _surveyNumber
    ) external onlyOwner {
        bytes32 landId = keccak256(abi.encodePacked(_landArea, _district, _taluk, _village, _blockNumber, _surveyNumber));
        require(!landExists[landId], "Land already registered");

        lands[landId] = Land({
            ownerName: _ownerName,
            landArea: _landArea,
            district: _district,
            taluk: _taluk,
            village: _village,
            blockNumber: _blockNumber,
            surveyNumber: _surveyNumber,
            ownerAddress: msg.sender,
            exists: true
        });
        landExists[landId] = true;

        emit LandRegistered(landId, msg.sender, _ownerName);
        emit Debug(landId); // Log the landId for debugging
    }

      function transferOwnership(bytes32 _landId, address _newOwner) external payable {
        require(lands[_landId].exists, "Land does not exist");
        require(msg.sender == lands[_landId].ownerAddress, "Only the owner can transfer");
        require(msg.value == 0.01 ether, "Must pay exactly 0.01 MATIC"); // Changed to 0.1 MATIC (0.1 ether units)

        address previousOwner = lands[_landId].ownerAddress;
        lands[_landId].ownerAddress = _newOwner;

        (bool sent, ) = previousOwner.call{value: 0.01 ether}("");
        require(sent, "Failed to send MATIC");

        emit OwnershipTransferred(_landId, previousOwner, _newOwner);
    }

    function getLand(bytes32 _landId) external view returns (Land memory) {
        require(lands[_landId].exists, "Land does not exist");
        return lands[_landId];
    }
}