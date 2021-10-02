// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFTCollection is ERC721Enumerable {
    uint256 public MAX_ELEMENTS = 5;
    uint256 public PRICE = 0.01 ether;
    address public CREATOR = 0x0000000000000000000000000000000000000000;
    uint256 public token_count;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    constructor() ERC721("My NFT", "MNFT") {}

    function _baseURI() internal view virtual override returns (string memory) {
        return "MIURL";
    }

    function _totalSupply() internal view returns (uint) {
        return _tokenIdTracker.current();
    }

    function totalMint() public view returns (uint256) {
        return _totalSupply();
    }

    function mint(address _to, uint256 _count) public payable {
        uint256 total = _totalSupply();
        require(total + _count <= MAX_ELEMENTS, "Max limit");
        require(total <= MAX_ELEMENTS, "Sale end");
        require(msg.value >= PRICE*_count, "Value below price");

        for (uint256 i = 0; i < _count; i++) {
            _mintAnElement(_to);
        }
    }

    function _mintAnElement(address _to) private {
        uint id = _totalSupply();
        _tokenIdTracker.increment();
        _safeMint(_to, id);
    }

    function withdrawAll() public {
        (bool success, ) = CREATOR.call{value:address(this).balance}("");
        require(success, "Transfer failed.");
    }
}
