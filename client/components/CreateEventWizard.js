import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";
import { NavBarConnect } from "./NavBarConnect";
import { event_factory_contract, event_abi, event_contract, event_factory_abi } from "@/lib/contract_config";
import { useWeb3React } from "@web3-react/core";
import { ethers, BigNumber } from "ethers";
import { useEagerConnect } from "@/utils/useEagerConnect";
import Link from "next/link";

export function CreateEventWizard() {
	const { account } = useWeb3React();
	const [events, setEvents] = useState([]);
	const [purchaseTokenDisabled, setPurchaseTokenDisabled] = useState(false);
	const [purchaseTokenValue, setPurchaseTokenValue] = useState("0xE097d6B3100777DC31B34dC2c58fB524C2e76921");
	const [ticketPriceDisabled, setTicketPriceDisabled] = useState(false);
	const [ticketPrice, setTicketPrice] = useState("10");

	const connectedOrNot = useEagerConnect();
	// console.log("Eager connect succeeded?", connectedOrNot);

	const handleFreeEvent = async () => {
		purchaseTokenDisabled ? setPurchaseTokenDisabled(false) : setPurchaseTokenDisabled(true);
		if (purchaseTokenValue == "0xE097d6B3100777DC31B34dC2c58fB524C2e76921") {
			setPurchaseTokenValue("0x0000000000000000000000000000000000000000");
		} else {
			setPurchaseTokenValue("0xE097d6B3100777DC31B34dC2c58fB524C2e76921");
		}

		ticketPriceDisabled ? setTicketPriceDisabled(false) : setTicketPriceDisabled(true);
		if (ticketPrice == "10") {
			setTicketPrice("0");
		} else {
			setTicketPrice("10");
		}
	};

	const createEvent = async (e) => {
		e.preventDefault();
		console.log("Inside create events function");
		try {
			const { ethereum } = window;
			const data = {
				eventName: e.target.eventName.value,
				eventCreator: e.target.eventCreator.value,
				maxTickets: e.target.maxTickets.value,
				ticketsPerAddress: e.target.ticketsPerAddress.value,
				ticketPrice: e.target.ticketPrice.value,
				expirationDuration: e.target.expirationDuration.value,
				purchaseToken: e.target.purchaseToken.value,
				gatingNFT: e.target.gatingNFT.value,
			};
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				let factory_contract_instance = new ethers.Contract(event_factory_contract, event_factory_abi, signer);
				if (account) {
					let tx = await factory_contract_instance.createNewEvent(data.eventCreator, data.ticketsPerAddress, data.expirationDuration, data.maxTickets, data.ticketPrice, data.eventName, data.purchaseToken, data.gatingNFT);
					console.log("New event = ", tx);
				}
			} else {
				console.log("Could not find ethereum object");
			}
		} catch (e) {
			console.log("Error while finding events", e);
		}
	};

	// useEffect(() => {
	// 	findEvents();
	// }, [account]);

	return (
		<>
			<NavBarConnect />
			<Container>
				<h4>Event creation page</h4>
				<hr />
				<Row>
					<Col md={12}>
						<Form onSubmit={createEvent}>
							<Row className="mb-3">
								<Form.Group as={Col} controlId="formEventName">
									<Form.Label>Event Name</Form.Label>
									<Form.Control name="eventName" defaultValue="Hello World" />
								</Form.Group>

								<Form.Group as={Col} controlId="formEventCreator">
									<Form.Label>Event Creator</Form.Label>
									<Form.Control name="eventCreator" defaultValue={account} />
								</Form.Group>
							</Row>
							<Row className="mb-3">
								<Form.Group as={Col} controlId="formMaxTickets">
									<Form.Label>Maximum tickets</Form.Label>
									<Form.Control name="maxTickets" defaultValue="100" />
								</Form.Group>

								<Form.Group as={Col} controlId="formTicketPerAddress">
									<Form.Label>Max tickets per address</Form.Label>
									<Form.Control name="ticketsPerAddress" defaultValue="10" />
								</Form.Group>
							</Row>

							<Row className="mb-3">
								<Form.Group as={Col} controlId="formTicketPrice">
									<Form.Label>Ticket Price</Form.Label>
									<Form.Control name="ticketPrice" defaultValue={ticketPrice} disabled={ticketPriceDisabled} />
								</Form.Group>
								<Form.Group as={Col} controlId="formExpirationDuration">
									<Form.Label>Event Expires on</Form.Label>
									<Form.Control name="expirationDuration" defaultValue="10100" />
								</Form.Group>
							</Row>
							<Row className="mb-3">
								<Form.Group as={Col} controlId="formPurchaseToken">
									<Form.Label>Purchase Token</Form.Label>
									<Form.Control name="purchaseToken" defaultValue={purchaseTokenValue} disabled={purchaseTokenDisabled} />
								</Form.Group>
								<Form.Group as={Col} controlId="formGatingNFT">
									<Form.Label>Gating NFT address</Form.Label>
									<Form.Control name="gatingNFT" defaultValue="0x0000000000000000000000000000000000000000" />
								</Form.Group>
							</Row>

							<Form.Group className="mb-3" id="formGridCheckbox">
								<Form.Check type="switch" id="custom-switch" label="Set as a free event" onChange={handleFreeEvent} />
							</Form.Group>

							<Button variant="primary" type="submit">
								Submit
							</Button>
						</Form>
					</Col>
					{/* <Col md={4}>
						<Button variant="outline-primary" onClick={createEvent}>
							Create
						</Button>{" "}
					</Col> */}
				</Row>
			</Container>
		</>
	);
}
