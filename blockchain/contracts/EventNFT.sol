// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventNFT is ERC721, Ownable {
    uint256 private _tokenId;
    mapping(uint256 => string) private _eventNames;

    event POAPMinted(address indexed student, uint256 tokenId, string eventName);

    constructor() ERC721("Campus Event POAP", "POAP") Ownable(msg.sender) {}

    function mintPOAP(address to, string memory eventName) external onlyOwner returns (uint256) {
        _tokenId++;
        _safeMint(to, _tokenId);
        _eventNames[_tokenId] = eventName;

        emit POAPMinted(to, _tokenId, eventName);
        return _tokenId;
    }

    function getEventName(uint256 tokenId) external view returns (string memory) {
        return _eventNames[tokenId];
    }

    function getUserNFTs(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;

        for (uint256 i = 1; i <= _tokenId; i++) {
            if (ownerOf(i) == user) {
                tokens[index] = i;
                index++;
            }
        }
        return tokens;
    }
}
