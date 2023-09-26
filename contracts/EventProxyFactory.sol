// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Event.sol";

//TODO - token-gate could be an NFT or ERC20 token
contract EventProxyFactory is Ownable {
    address public implementationContract;
    address[] public allClones;
    address[] public implementionContractVersions;

    mapping(address => address[]) public operatorEvents;

    event NewClone(address _clone);

    constructor(address _implementation) {
        implementationContract = _implementation;
        implementionContractVersions.push(_implementation);
    }

    // TODO - add onlyOwner to this function
    function createNewEvent(
        address payable _eventAdmin,
        uint256 _ticketsPerAddress,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _maxTickets,
        uint256 _ticketPrice,
        string calldata _eventName,
        address _purchaseTokenAddress,
        address _gatingNFT,
        uint8 _eventType,
        uint8 _eventPlatform
    ) external payable returns (address instance) {
        instance = Clones.clone(implementationContract);
        Event(instance).initialize(
            _eventAdmin,
            _ticketsPerAddress,
            _startDate,
            _endDate,
            _maxTickets,
            _ticketPrice,
            _eventName,
            _purchaseTokenAddress,
            _gatingNFT,
            _eventType,
            _eventPlatform
        );

        allClones.push(instance);
        //List of all events created by this operator
        operatorEvents[msg.sender].push(instance);
        emit NewClone(instance);
        return instance;
    }

    //TODO - only return events for the current implementation
    function getOperatorEvents(address _operator) external view returns (address[] memory events) {
        events = operatorEvents[_operator];
    }

    function updateImplementationContract(address _implementation) external onlyOwner {
        implementationContract = _implementation;
        implementionContractVersions.push(_implementation);
    }
}
