import { useRouter } from "next/router";
import { useWeb3React } from "@web3-react/core";
import { useEagerConnect } from "@/utils/useEagerConnect";
import React, { useState, useEffect } from "react";
import { event_factory_contract, event_abi, event_contract, event_factory_abi, erc20_abi } from "@/lib/contract_config";
import { ethers, BigNumber } from "ethers";
import { NavBarConnect } from "@/components/NavBarConnect";
import { ListGroup, Row, Col, Container, Button, Form } from "react-bootstrap";

export function EventDetails() {
	const router = useRouter();
	const { account } = useWeb3React();
	const [eventData, setEventData] = useState({});

	const connectedOrNot = useEagerConnect();

	const buyTicket = async (e) => {
		e.preventDefault();
		console.log("Inside buy ticket function");
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const current_event_contract = router?.query?.eventId;
				const numTickets = e.target.numTickets.value;
				console.log("Contract address = ", event_contract);
				let event_contract_instance = new ethers.Contract(current_event_contract, event_abi, signer);
				if (account) {
					//First, get the ticket price
					let ticketPrice = await event_contract_instance.ticketPrice();
					ticketPrice = ticketPrice.toNumber();
					const numTokens = ticketPrice * numTickets;
					const purchaseToken = await event_contract_instance.purchaseToken();

					if (ticketPrice > 0) {
						// //Ask the user to approve the required tokens to the contract
						const purchase_token_instance = new ethers.Contract(purchaseToken, erc20_abi, signer);
						const approve_tx = await purchase_token_instance.approve(current_event_contract, numTokens);
						let approve_receipt = await approve_tx.wait();
						if (approve_receipt) {
							await event_contract_instance.buyTicket(numTickets);
						}
						// await event_contract_instance.buyTicket(numTickets);
					}
				}
			} else {
				console.log("Could not find ethereum object");
			}
		} catch (e) {
			console.log("Error while finding events", e);
		}
	};

	const getEventData = async () => {
		console.log("Inside the function getEventData");
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const current_event_contract = router?.query?.eventId;
				console.log("Contract address = ", current_event_contract);
				let event_contract_instance = new ethers.Contract(current_event_contract, event_abi, signer);
				if (account) {
					const eventName = await event_contract_instance.name();
					const expirationDuration = await event_contract_instance.expirationDuration();
					const gatingNFT = await event_contract_instance.gatingNFT();
					const maxTickets = await event_contract_instance.maxTickets();
					const purchaseToken = await event_contract_instance.purchaseToken();
					const ticketPrice = await event_contract_instance.ticketPrice();
					const ticketsPerAddress = await event_contract_instance.ticketsPerAddress();
					setEventData((eventData) => ({
						"current_event_contract": current_event_contract,
						"eventName": eventName,
						"expirationDuration": expirationDuration.toNumber(),
						"gatingNFT": gatingNFT,
						"maxTickets": maxTickets.toNumber(),
						"purchaseToken": purchaseToken,
						"ticketPrice": ticketPrice.toNumber(),
						"ticketsPerAddress": ticketsPerAddress.toNumber(),
					}));
				}
			} else {
				console.log("Could not find ethereum object");
			}
		} catch (e) {
			console.log("Error while finding events", e);
		}
	};

	useEffect(() => {
		getEventData();
	}, [account]);

	//TODO - if the visitor is the owner/creator of this event, show them the option to update this event
	return (
		<>
			<NavBarConnect />
			<Container>
				<Row>
					<Col md={8}>
						<ListGroup as="ol" numbered>
							<ListGroup.Item as="li">Contract address = {eventData.current_event_contract}</ListGroup.Item>
							<ListGroup.Item as="li">Name = {eventData.eventName}</ListGroup.Item>
							<ListGroup.Item as="li">Expiry = {eventData.expirationDuration}</ListGroup.Item>
							<ListGroup.Item as="li">Gating NFT = {eventData.gatingNFT}</ListGroup.Item>
							<ListGroup.Item as="li">Maximum tickets = {eventData.maxTickets}</ListGroup.Item>
							<ListGroup.Item as="li">Purchase Token = {eventData.purchaseToken}</ListGroup.Item>
							<ListGroup.Item as="li">Ticket Price = {eventData.ticketPrice}</ListGroup.Item>
							<ListGroup.Item as="li">Tickets per address = {eventData.ticketsPerAddress}</ListGroup.Item>
						</ListGroup>
					</Col>
					<Col md={4}>
						<h4>Buy tickets</h4>
						<hr />
						<Form onSubmit={buyTicket}>
							<Row className="mb-3">
								<Form.Group as={Col} controlId="formGridState">
									<Form.Label>Number of tickets</Form.Label>
									<Form.Control size="" name="numTickets" placeholder="0" />
								</Form.Group>
							</Row>
							<Button variant="primary" type="submit">
								Buy
							</Button>
						</Form>
					</Col>
				</Row>
			</Container>
		</>
	);
}
