//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
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
    AccessControlUpgradeable,
    ERC721BurnableUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

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
    // TODO - remove this param because it already exists in the NFT name
    string public eventName;
    IERC20 public purchaseToken;
    IERC721 public gatingNFT;

    mapping(address => uint256) public ticketsCounter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // TODO - Cater to gatingNFT as 1155
    // TODO - Validate the inputs
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
        purchaseToken = IERC20(_purchaseTokenAddress);
        gatingNFT = IERC721(_gatingNFT);
        //Had to do this because the proxy clone sets this to 0x0000
        platformFeeAddress = 0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF;

        __ERC721_init(_eventName, "");
        __ERC721Enumerable_init();
        __Pausable_init();
        __ERC721Burnable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, _eventCreator);
        _grantRole(CREATOR_ROLE, _eventCreator);
    }

    function pause() public onlyRole(CREATOR_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(CREATOR_ROLE) {
        _unpause();
    }

    // TODO - Check for expiration duration
    function buyTicket(uint256 _numTickets) public {
        require(_tokenIdCounter.current() < maxTickets);
        require(ticketsCounter[msg.sender] <= ticketsPerAddress);
        if (address(gatingNFT) != address(0)) {
            //Make sure that the buyer actually holds the required gating NFT
            require(gatingNFT.balanceOf(msg.sender) > 0);
        }

        if ((ticketPrice > 0) && (address(purchaseToken) != address(0))) {
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

    // TODO - Validate the inputs for all the set functions
    function setPlatformFees(uint256 _fees) external onlyRole(CREATOR_ROLE) {
        platformFeesPercentInBPS = _fees;
    }

    function setPlatformFeeAddress(address _newAddress) external onlyRole(CREATOR_ROLE) {
        platformFeeAddress = _newAddress;
    }

    function setMaxTickets(uint256 _maxTickets) external onlyRole(CREATOR_ROLE) {
        maxTickets = _maxTickets;
    }

    function setTicketsPerAddress(uint256 _ticketsPerAddress) external onlyRole(CREATOR_ROLE) {
        ticketsPerAddress = _ticketsPerAddress;
    }

    function setGatingNFT(address _gatingNFT) external onlyRole(CREATOR_ROLE) {
        gatingNFT = IERC721(_gatingNFT);
    }

    function setEventName(string memory _name) external onlyRole(CREATOR_ROLE) {
        eventName = _name;
    }

    function setExpirationDuration(uint256 _duration) external onlyRole(CREATOR_ROLE) {
        expirationDuration = _duration;
    }

    function setPurchaseToken(address _token) external onlyRole(CREATOR_ROLE) {
        purchaseToken = IERC20(_token);
    }

    function setTicketPrice(uint256 _price) external onlyRole(CREATOR_ROLE) {
        ticketPrice = _price;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://example.com/";
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
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
