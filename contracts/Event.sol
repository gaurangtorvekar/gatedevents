//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Event is Initializable, ERC721Upgradeable, AccessControlUpgradeable, ERC721BurnableUpgradeable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");

    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeERC20 for IERC20;

    CountersUpgradeable.Counter private _tokenIdCounter;
    address public platformFeeAddress = 0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF;
    address public eventAdmin;
    uint256 public maxTickets;
    uint256 public ticketsPerAddress;
    uint256 public expirationDuration;
    uint256 public ticketPrice;
    uint256 public startDate;
    uint256 public endDate;
    // Setting a default value of 5% platform fees - change later
    uint256 public platformFeesPercentInBPS = 500;
    // TODO - remove this param because it already exists in the NFT name
    string public eventName;
    IERC20 public purchaseToken;
    IERC721 public gatingNFT;

    enum EventTypes {
        InPerson,
        Online
    }
    enum EventPlatforms {
        Zoom,
        GoogleMeet,
        MicrosoftTeams,
        Skype,
        Other
    }

    struct EventConfig {
        address payable eventAdmin;
        uint256 ticketsPerAddress;
        uint256 startDate;
        uint256 endDate;
        uint256 maxTickets;
        uint256 ticketPrice;
        string eventName;
        address purchaseTokenAddress;
        address gatingNFT;
        uint8 eventType;
        uint8 eventPlatform;
    }

    EventTypes public eventType;
    EventPlatforms public eventPlatform;

    mapping(address => uint256) public ticketsCounter;

    // This will store the keys so that we can retrieve the additionalInfo mapping later
    string[] public infoKeys;
    mapping(string => string) public additionalInfo;

    //Create an event to emit when an NFT is safe minted
    event TicketMinted(address indexed _to, uint256 indexed _tokenId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // TODO - Cater to gatingNFT as 1155
    // TODO - Validate the inputs
    function initialize(EventConfig memory config) public initializer {
        eventAdmin = config.eventAdmin;
        ticketsPerAddress = config.ticketsPerAddress;
        startDate = config.startDate;
        endDate = config.endDate;
        maxTickets = config.maxTickets;
        ticketPrice = config.ticketPrice;
        eventName = config.eventName;
        purchaseToken = IERC20(config.purchaseTokenAddress);
        gatingNFT = IERC721(config.gatingNFT);
        eventType = EventTypes(config.eventType);
        eventPlatform = EventPlatforms(config.eventPlatform);
        //Had to do this because the proxy clone sets this to 0x0000
        platformFeeAddress = 0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF;

        __ERC721_init(config.eventName, "");
        __ERC721Burnable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, config.eventAdmin);
        _grantRole(CREATOR_ROLE, config.eventAdmin);
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

            _tranferERC20Amount(msg.sender, eventAdmin, creatorFees);
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
        emit TicketMinted(to, tokenId);
    }

    function _tranferERC20Amount(address _sender, address _receiver, uint256 _amount) internal {
        purchaseToken.safeTransferFrom(_sender, _receiver, _amount);
    }

    function setAdditionalInfo(string[] memory keys, string[] memory values) external onlyRole(CREATOR_ROLE) {
        require(keys.length == values.length, "Keys and values length mismatch");

        for (uint256 i = 0; i < keys.length; i++) {
            // Check if this key is a new key and hasn't been set before
            if (bytes(additionalInfo[keys[i]]).length == 0) {
                infoKeys.push(keys[i]);
            }
            additionalInfo[keys[i]] = values[i];
        }
    }

    function getAllAdditionalInfo() external view returns (string[] memory keys, string[] memory values) {
        keys = new string[](infoKeys.length);
        values = new string[](infoKeys.length);

        for (uint256 i = 0; i < infoKeys.length; i++) {
            keys[i] = infoKeys[i];
            values[i] = additionalInfo[infoKeys[i]];
        }

        return (keys, values);
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

    function setEventType(uint8 _eventType) external onlyRole(CREATOR_ROLE) {
        eventType = EventTypes(_eventType);
    }

    function setEventPlatform(uint8 _eventPlatform) external onlyRole(CREATOR_ROLE) {
        eventPlatform = EventPlatforms(_eventPlatform);
    }

    function setStartDate(uint256 _startDate) external onlyRole(CREATOR_ROLE) {
        startDate = _startDate;
    }

    function setEndDate(uint256 _endDate) external onlyRole(CREATOR_ROLE) {
        endDate = _endDate;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://example.com/";
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721Upgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
