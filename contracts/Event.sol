//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Event is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    ERC721BurnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeERC20 for IERC20;

    CountersUpgradeable.Counter private _tokenIdCounter;
    address public platformFeeAddress = 0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF;
    address public eventCreator;
    uint256 public maxTickets;
    uint256 public ticketsPerAddress;
    uint256 public expirationDuration;
    uint256 public ticketPrice;
    // Setting a default value of 5% platform fees - change later
    uint256 public platformFeesPercentInBPS = 500;
    string public eventName;
    IERC20 public purchaseToken;
    IERC721 public gatingNFT;

    mapping(address => uint256) public ticketsCounter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // TODO - Cater to gatingNFT as 1155
    function initialize(
        address payable _eventCreator,
        uint256 _ticketsPerAddress,
        uint256 _expirationDuration,
        uint256 _maxTickets,
        uint256 _ticketPrice,
        string calldata _eventName,
        address _purchaseTokenAddress,
        address _gatingNFT
    ) public initializer {
        eventCreator = _eventCreator;
        ticketsPerAddress = _ticketsPerAddress;
        maxTickets = _maxTickets;
        expirationDuration = _expirationDuration;
        ticketPrice = _ticketPrice;
        eventName = _eventName;

        if (_purchaseTokenAddress != address(0)) {
            purchaseToken = IERC20(_purchaseTokenAddress);
        }

        if (_gatingNFT != address(0)) {
            gatingNFT = IERC721(_gatingNFT);
        }

        __ERC721_init(_eventName, "");
        __ERC721Enumerable_init();
        __Pausable_init();
        __Ownable_init();
        __ERC721Burnable_init();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function buyTicket(uint256 _numTickets) public {
        require(_tokenIdCounter.current() < maxTickets);
        require(ticketsCounter[msg.sender] <= ticketsPerAddress);
        //Make sure that the buyer actually holds the required gating NFT
        // if (gatingNFT != address(0)) {
        //     require(gatingNFT.balanceOf(msg.sender) > 0);
        // }
        require(gatingNFT.balanceOf(msg.sender) > 0);

        if (ticketPrice > 0) {
            uint256 totalPrice = _numTickets * ticketPrice;
            uint256 platformFees = (totalPrice * platformFeesPercentInBPS) / 10000;
            uint256 creatorFees = totalPrice - platformFees;

            _tranferERC20Amount(msg.sender, eventCreator, creatorFees);
            _tranferERC20Amount(msg.sender, platformFeeAddress, platformFees);
        }

        for (uint8 i = 0; i < _numTickets; i++) {
            safeMint(msg.sender);
        }
        ticketsCounter[msg.sender] += _numTickets;
    }

    function safeMint(address to) internal {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function _tranferERC20Amount(address _sender, address _receiver, uint256 _amount) internal {
        purchaseToken.safeTransferFrom(_sender, _receiver, _amount);
    }

    function setPlatformFees(uint256 _fees) external onlyOwner {
        platformFeesPercentInBPS = _fees;
    }

    function setMaxTickets(uint256 _maxTickets) external onlyOwner {
        maxTickets = _maxTickets;
    }

    function setTicketsPerAddress(uint256 _ticketsPerAddress) external onlyOwner {
        ticketsPerAddress = _ticketsPerAddress;
    }

    function setGatingNFT(address _gatingNFT) external onlyOwner {
        gatingNFT = IERC721(_gatingNFT);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
