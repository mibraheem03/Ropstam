// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ropstam.sol";

contract HammerAndOpenApe {
    // Hammer Settings

    address ropstamToken;
    string public _name;
    string public _symbol;
    uint8 public _decimals;

    uint256 public _totalSupply;
    mapping(address => uint256) public _balances;
    mapping(address => mapping(address => uint256)) public _allowances;

    // OpenApe Settings
    uint256 NFTPrice;
    string public _nftName;
    string public _nftSymbol;
    uint256 public _NFTtotalSupply;
    mapping(uint256 => address) public _tokenOwners;
    mapping(address => uint256[]) public _ownedTokens;
    mapping(uint256 => uint256) public _ownedTokenIndex;
    mapping(uint256 => string) public _tokenURIs;

    constructor(address _ropstam) {
        ropstamToken = _ropstam;
        _name = "HAMMER";
        _symbol = "HAM";
        _decimals = 18;

        // NFT
        _nftName = "Open Apes";
        _nftSymbol = "OPENAPES";
        NFTPrice = 100 ether;
    }

    function allowance(
        address owner,
        address spender
    ) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);
        return true;
    }

    function mintHammerTokens(address account, uint256 amount) public {
        require(account != address(0), "ERC20: mint to the zero address");
        require(
            _ownedTokens[account].length > 0,
            "NFT Holder Can not Buy Hammer Token"
        );

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(
            _balances[sender] >= amount,
            "ERC20: transfer amount exceeds balance"
        );

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function mintNFT(
        address to,
        uint256 tokenId,
        string memory tokenURI
    ) public {
        Ropstam ropstamTokenContract = Ropstam(ropstamToken);
        uint256 userRopstamBalance = ropstamTokenContract.balanceOf(msg.sender);
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");
        require(_balances[to] == 0, "Hammer Owner Can not Mint NFT");
        require(
            userRopstamBalance > NFTPrice,
            "Not Enought Ropstam In Account"
        );
        _totalSupply += 1;
        _tokenOwners[tokenId] = to;
        _ownedTokens[to].push(tokenId);
        _ownedTokenIndex[tokenId] = _ownedTokens[to].length - 1;
        _tokenURIs[tokenId] = tokenURI;

        emit TransferNFT(address(0), to, tokenId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _tokenOwners[tokenId] != address(0);
    }

    event TransferNFT(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}
