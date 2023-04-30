import { useRouter } from "next/router";
import { useWeb3React } from "@web3-react/core";
import { useEagerConnect } from "@/utils/useEagerConnect";
import React, { useState, useEffect, useRef } from "react";
import { event_factory_contract, event_abi, event_contract, event_factory_abi, erc20_abi } from "@/lib/contract_config";
import { ethers, BigNumber } from "ethers";
import { NavBarConnect } from "@/components/NavBarConnect";
import { ListGroup, Row, Col, Container, Button, Form, Alert, InputGroup } from "react-bootstrap";

export function EventDetails() {
	const router = useRouter();
	const { account } = useWeb3React();
	const [eventData, setEventData] = useState({});
	const [isEventCreator, setIsEventCreator] = useState(false);
	const connectedOrNot = useEagerConnect();

	const [editMaxTickets, setEditMaxTickets] = useState(false);
	const [editEventName, setEditEventName] = useState(false);
	const [editExpirationDuration, setEditExpirationDuration] = useState(false);
	const [editGatingNFT, setEditGatingNFT] = useState(false);
	const [editPurchaseToken, setEditPurchaseToken] = useState(false);
	const [editTicketPrice, setEditTicketPrice] = useState(false);
	const [editTicketsPerAddress, setEditTicketsPerAddress] = useState(false);

	const maxTicketRef = useRef(null);
	const eventNameRef = useRef(null);
	const expirationDurationRef = useRef(null);
	const gatingNFTRef = useRef(null);
	const purchaseTokenRef = useRef(null);
	const ticketPriceRef = useRef(null);
	const ticketsPerAddressRef = useRef(null);

	let event_contract_instance, signer, current_event_contract;
	try {
		const { ethereum } = window;
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			signer = provider.getSigner();
			current_event_contract = router?.query?.eventId;
			console.log("Contract address inside try = ", current_event_contract);
			event_contract_instance = new ethers.Contract(current_event_contract, event_abi, signer);
		} else {
			console.log("Could not find ethereum object");
		}
	} catch (e) {
		// console.log("Error while finding events", e);
	}

	const buyTicket = async (e) => {
		e.preventDefault();
		console.log("Inside buy ticket function");
		if (account) {
			//First, get the ticket price
			let numTickets = e.target.numTickets.value;
			console.log(numTickets);
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
			}
		}
	};

	const updateMaxTickets = async () => {
		console.log("Inside updateMaxTickets");
		const updatedMaxTickets = maxTicketRef.current.value;
		console.log("New value = ", updatedMaxTickets);
		if (account) {
			let tx = await event_contract_instance.setMaxTickets(updatedMaxTickets);
			let tx_receipt = await tx.wait();
			setEditMaxTickets(false);
		}
	};

	const updateGatingNFT = async () => {
		console.log("Inside updateMaxTickets");
		const updateGatingNFT = gatingNFTRef.current.value;
		console.log("New value = ", updateGatingNFT);
		if (account) {
			let tx = await event_contract_instance.setGatingNFT(updateGatingNFT);
			let tx_receipt = await tx.wait();
			setEditGatingNFT(false);
		}
	};

	const updatePurchaseToken = async () => {
		console.log("Inside updatePurchaseToken");
		const updatePurchaseToken = purchaseTokenRef.current.value;
		console.log("New value = ", updatePurchaseToken);
		if (account) {
			// 0xE097d6B3100777DC31B34dC2c58fB524C2e76921
			let tx = await event_contract_instance.setPurchaseToken(updatePurchaseToken);
			let tx_receipt = await tx.wait();
			setEditPurchaseToken(false);
		}
	};

	const updateEventName = async () => {
		console.log("Inside updateEventName");
		const updateEventName = eventNameRef.current.value;
		console.log("New value = ", updateEventName);
		if (account) {
			let tx = await event_contract_instance.setEventName(updateEventName);
			let tx_receipt = await tx.wait();
			setEditEventName(false);
		}
	};

	const updateExpirationDuration = async () => {
		console.log("Inside updateExpirationDuration");
		const updateExpirationDuration = expirationDurationRef.current.value;
		console.log("New value = ", updateExpirationDuration);
		if (account) {
			let tx = await event_contract_instance.setExpirationDuration(updateExpirationDuration);
			let tx_receipt = await tx.wait();
			setEditExpirationDuration(false);
		}
	};

	const updateTicketPrice = async () => {
		console.log("Inside updateTicketPrice");
		const updateTicketPrice = ticketPriceRef.current.value;
		console.log("New value = ", updateTicketPrice);
		if (account) {
			let tx = await event_contract_instance.setTicketPrice(updateTicketPrice);
			let tx_receipt = await tx.wait();
			setEditTicketPrice(false);
		}
	};

	const updateTicketsPerAddress = async () => {
		console.log("Inside updateTicketsPerAddress");
		const updateTicketsPerAddress = ticketsPerAddressRef.current.value;
		console.log("New value = ", updateTicketsPerAddress);
		if (account) {
			let tx = await event_contract_instance.setTicketsPerAddress(updateTicketsPerAddress);
			let tx_receipt = await tx.wait();
			setEditTicketsPerAddress(false);
		}
	};

	const getEventData = async () => {
		console.log("Inside the function getEventData");
		const current_event_contract = router?.query?.eventId;
		if (account) {
			const eventCreator = await event_contract_instance.eventCreator();
			if (account == eventCreator) {
				console.log("Setting event creator true");
				setIsEventCreator(true);
			}

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
	};

	useEffect(() => {
		getEventData();
	}, [account]);

	//TODO - if the visitor is the owner/creator of this event, show them the option to update this event
	return (
		<>
			<NavBarConnect />

			<Container>
				{connectedOrNot ? null : (
					<Alert variant="danger" onClose={() => setShow(false)} dismissible>
						Please make sure that your Metamask is connected to <Alert.Link href="https://scroll.io/alpha">Scroll Alpha Testnet</Alert.Link> or Goerli Testnet. Please choose the correct chain on Metamask to proceed.
					</Alert>
				)}
				<Row>
					<Col md={8}>
						<ListGroup>
							<ListGroup.Item>Contract address = {eventData.current_event_contract}</ListGroup.Item>
							<ListGroup.Item>
								{editEventName ? (
									<InputGroup className="mb-3">
										<Form.Control placeholder="Event Name" ref={eventNameRef} />
										<Button onClick={updateEventName} variant="outline-primary" id="button-addon2">
											&#10003;
										</Button>
										<Button onClick={() => setEditEventName(false)} variant="outline-secondary">
											&#10060;
										</Button>
									</InputGroup>
								) : (
									<div>
										Name = {eventData.eventName}{" "}
										{isEventCreator ? (
											<Button onClick={() => setEditEventName(true)} className="float-end btn-sm" variant="primary" type="submit">
												Edit
											</Button>
										) : null}
									</div>
								)}
							</ListGroup.Item>
							<ListGroup.Item>
								{editExpirationDuration ? (
									<InputGroup className="mb-3">
										<Form.Control placeholder="Expiration Duration" ref={expirationDurationRef} />
										<Button onClick={updateExpirationDuration} variant="outline-primary" id="button-addon2">
											&#10003;
										</Button>
										<Button onClick={() => setEditExpirationDuration(false)} variant="outline-secondary">
											&#10060;
										</Button>
									</InputGroup>
								) : (
									<div>
										Expiry = {eventData.expirationDuration}{" "}
										{isEventCreator ? (
											<Button
												onClick={() => {
													setEditExpirationDuration(true);
												}}
												className="float-end btn-sm"
												variant="primary"
												type="submit"
											>
												Edit
											</Button>
										) : null}
									</div>
								)}
							</ListGroup.Item>
							<ListGroup.Item>
								{editGatingNFT ? (
									<InputGroup className="mb-3">
										<Form.Control placeholder="Gating NFT" ref={gatingNFTRef} />
										<Button onClick={updateGatingNFT} variant="outline-primary" id="button-addon2">
											&#10003;
										</Button>
										<Button onClick={() => setEditGatingNFT(false)} variant="outline-secondary">
											&#10060;
										</Button>
									</InputGroup>
								) : (
									<div>
										Gating NFT = {eventData.gatingNFT}{" "}
										{isEventCreator ? (
											<Button onClick={() => setEditGatingNFT(true)} className="float-end btn-sm" variant="primary" type="submit">
												Edit
											</Button>
										) : null}
									</div>
								)}
							</ListGroup.Item>
							<ListGroup.Item>
								{editMaxTickets ? (
									<InputGroup className="mb-3">
										<Form.Control placeholder="Max Tickets" ref={maxTicketRef} />
										<Button onClick={updateMaxTickets} variant="outline-primary" id="button-addon2">
											&#10003;
										</Button>
										<Button onClick={() => setEditMaxTickets(false)} variant="outline-secondary">
											&#10060;
										</Button>
									</InputGroup>
								) : (
									<div>
										Maximum tickets = {eventData.maxTickets}{" "}
										{isEventCreator ? (
											<Button onClick={() => setEditMaxTickets(true)} className="float-end btn-sm" variant="primary" type="submit">
												Edit
											</Button>
										) : null}
									</div>
								)}
							</ListGroup.Item>
							<ListGroup.Item>
								{editPurchaseToken ? (
									<InputGroup className="mb-3">
										<Form.Control placeholder="Purchase Token" ref={purchaseTokenRef} />
										<Button onClick={updatePurchaseToken} variant="outline-primary" id="button-addon2">
											&#10003;
										</Button>
										<Button onClick={() => setEditPurchaseToken(false)} variant="outline-secondary">
											&#10060;
										</Button>
									</InputGroup>
								) : (
									<div>
										Purchase Token = {eventData.purchaseToken}{" "}
										{isEventCreator ? (
											<Button onClick={() => setEditPurchaseToken(true)} className="float-end btn-sm" variant="primary" type="submit">
												Edit
											</Button>
										) : null}
									</div>
								)}
							</ListGroup.Item>
							<ListGroup.Item>
								{editTicketPrice ? (
									<InputGroup className="mb-3">
										<Form.Control placeholder="Ticket Price" ref={ticketPriceRef} />
										<Button onClick={updateTicketPrice} variant="outline-primary" id="button-addon2">
											&#10003;
										</Button>
										<Button onClick={() => setEditTicketPrice(false)} variant="outline-secondary">
											&#10060;
										</Button>
									</InputGroup>
								) : (
									<div>
										Ticket Price = {eventData.ticketPrice}{" "}
										{isEventCreator ? (
											<Button onClick={() => setEditTicketPrice(true)} className="float-end btn-sm" variant="primary" type="submit">
												Edit
											</Button>
										) : null}
									</div>
								)}
							</ListGroup.Item>
							<ListGroup.Item>
								{editTicketsPerAddress ? (
									<InputGroup className="mb-3">
										<Form.Control placeholder="Tickets per address" ref={ticketsPerAddressRef} />
										<Button onClick={updateTicketsPerAddress} variant="outline-primary" id="button-addon2">
											&#10003;
										</Button>
										<Button onClick={() => setEditTicketsPerAddress(false)} variant="outline-secondary">
											&#10060;
										</Button>
									</InputGroup>
								) : (
									<div>
										Tickets per address = {eventData.ticketsPerAddress}{" "}
										{isEventCreator ? (
											<Button onClick={() => setEditTicketsPerAddress(true)} className="float-end btn-sm" variant="primary" type="submit">
												Edit
											</Button>
										) : null}
									</div>
								)}
							</ListGroup.Item>
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
