//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

interface IEvent {
    function initialize(
        address payable _eventCreator,
        uint256 _ticketsPerAddress,
        uint256 _expirationDuration,
        uint256 _maxTickets,
        uint256 _ticketPrice,
        string calldata _eventName,
        address _purchaseTokenAddress,
        address _gatingNFT
    ) external;
}
