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
        uint256 _startDate,
        uint256 _endDate,
        string calldata _eventName,
        address _purchaseTokenAddress,
        address _gatingNFT,
        uint8 _eventPlatform
    ) external payable onlyOwner returns (address instance) {
        instance = Clones.clone(implementationContract);

        // Event.EventConfig memory config = Event.EventConfig({
        //     eventAdmin: _eventAdmin,
        //     ticketsPerAddress: _ticketsPerAddress,
        //     startDate: _startDate,
        //     endDate: _endDate,
        //     maxTickets: _maxTickets,
        //     ticketPrice: _ticketPrice,
        //     eventName: _eventName,
        //     purchaseTokenAddress: _purchaseTokenAddress,
        //     gatingNFT: _gatingNFT,
        //     eventType: _eventType,
        //     eventPlatform: _eventPlatform
        // });

        Event.EventConfig memory config = Event.EventConfig({
            eventAdmin: _eventAdmin,
            ticketsPerAddress: 0,
            startDate: _startDate,
            endDate: _endDate,
            maxTickets: 0,
            ticketPrice: 0,
            eventName: _eventName,
            purchaseTokenAddress: _purchaseTokenAddress,
            gatingNFT: _gatingNFT,
            eventType: 0,
            eventPlatform: _eventPlatform
        });

        Event(instance).initialize(config);

        allClones.push(instance);
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
