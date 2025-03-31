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
        string documentHash;
        bool verified;
        uint256 price; // Added price field
    }

    mapping(bytes32 => Land) public lands;
    mapping(bytes32 => bool) public landExists;
    mapping(address => bytes32[]) public ownerLands;

    event LandRegistered(
        bytes32 indexed landId, 
        address indexed owner, 
        string ownerName,
        string documentHash,
        uint256 price
    );
    event LandVerified(bytes32 indexed landId);
    event OwnershipTransferred(bytes32 indexed landId, address indexed from, address indexed to, uint256 price);

    constructor() Ownable(msg.sender) {}
// Add this modifier to restrict land verification to admin/owner
modifier onlyAdmin() {
    require(msg.sender == owner(), "Only admin can verify lands");
    _;
}

// Update the function signature
function verifyAndRegisterLand(
    bytes32 _landId,
    string memory _ownerName,
    uint256 _landArea,
    string memory _district,
    string memory _taluk,
    string memory _village,
    uint256 _blockNumber,
    uint256 _surveyNumber,
    address _ownerAddress,
    string memory _documentHash,
    uint256 _price
) external onlyAdmin {  // Changed from onlyOwner to onlyAdmin
    require(!landExists[_landId], "Land already registered");
    require(_ownerAddress != address(0), "Invalid owner address");
    require(_price > 0, "Price must be greater than 0");
    
    lands[_landId] = Land({
        ownerName: _ownerName,
        landArea: _landArea,
        district: _district,
        taluk: _taluk,
        village: _village,
        blockNumber: _blockNumber,
        surveyNumber: _surveyNumber,
        ownerAddress: _ownerAddress,
        exists: true,
        documentHash: _documentHash,
        verified: true,
        price: _price
    });

    landExists[_landId] = true;
    ownerLands[_ownerAddress].push(_landId);

    emit LandRegistered(_landId, _ownerAddress, _ownerName, _documentHash, _price);
    emit LandVerified(_landId);
}

    function transferLandOwnership(bytes32 _landId, string memory _ownerName) external payable {
        Land storage land = lands[_landId];
        require(land.exists, "Land does not exist");
        require(msg.value == land.price, "Must pay exact land price");
        require(land.ownerAddress != msg.sender, "Cannot transfer to yourself");
        
        address payable previousOwner = payable(land.ownerAddress);
        land.ownerAddress = msg.sender;
        land.ownerName = _ownerName;
        
        (bool sent, ) = previousOwner.call{value: msg.value}("");
        require(sent, "Payment transfer failed");
        
        emit OwnershipTransferred(_landId, previousOwner, msg.sender, land.price);
    }
    function getLandsByOwner(address _owner) external view returns (bytes32[] memory) {
        return ownerLands[_owner];
    }
    function getLand(bytes32 _landId) external view returns (Land memory) {
        require(lands[_landId].exists, "Land does not exist");
        return lands[_landId];
    }
}