// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Ropstam.sol";

contract RopstamMarketplace is ERC721, Ownable {
    Ropstam private ropstamToken;

    mapping(uint256 => string) private _tokenURIs;

    mapping(address => bool) public isHammerOwner;
    mapping(address => bool) public isOpenApesOwner;

    uint256 public hammerPrice = 100;
    uint256 public openApesPrice = 100;

    constructor(address _ropstamToken) ERC721("Open Apes", "APES") {
        ropstamToken = Ropstam(_ropstamToken);
    }

    function buyHammer() external {
        require(!isHammerOwner[msg.sender], "Already owns a Hammer");
        require(
            ropstamToken.transferFrom(msg.sender, address(this), hammerPrice),
            "Transfer failed"
        );
        isHammerOwner[msg.sender] = true;
    }

    function buyOpenApes() external {
        require(!isOpenApesOwner[msg.sender], "Already owns an Open Ape");
        require(
            ropstamToken.transferFrom(msg.sender, address(this), openApesPrice),
            "Transfer failed"
        );
        isOpenApesOwner[msg.sender] = true;
    }

    function setHammerPrice(uint256 price) external onlyOwner {
        hammerPrice = price;
    }

    function setOpenApesPrice(uint256 price) external onlyOwner {
        openApesPrice = price;
    }

    function mint(
        address to,
        uint256 tokenId,
        string memory tokenURI
    ) external onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function withdraw() external onlyOwner {
        uint256 ropstamBalance = ropstamToken.balanceOf(address(this));
        if (ropstamBalance > 0) {
            ropstamToken.transfer(owner(), ropstamBalance);
        }
    }

    function _setTokenURI(
        uint256 tokenId,
        string memory tokenURI
    ) internal virtual {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = tokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        string memory _tokenURI = _tokenURIs[tokenId];
        return _tokenURI;
    }
}
