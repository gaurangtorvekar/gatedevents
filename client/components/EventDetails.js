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

	let event_contract_instance;
	try {
		const { ethereum } = window;
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const current_event_contract = router?.query?.eventId;
			console.log("Contract address = ", current_event_contract);
			event_contract_instance = new ethers.Contract(current_event_contract, event_abi, signer);
		} else {
			console.log("Could not find ethereum object");
		}
	} catch (e) {
		console.log("Error while finding events", e);
	}

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
								Name = {eventData.eventName}{" "}
								{isEventCreator ? (
									<Button className="float-end btn-sm" variant="primary" type="submit">
										Edit
									</Button>
								) : null}
							</ListGroup.Item>
							<ListGroup.Item>
								Expiry = {eventData.expirationDuration}{" "}
								{isEventCreator ? (
									<Button className="float-end btn-sm" variant="primary" type="submit">
										Edit
									</Button>
								) : null}
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
								Purchase Token = {eventData.purchaseToken}{" "}
								{isEventCreator ? (
									<Button className="float-end btn-sm" variant="primary" type="submit">
										Edit
									</Button>
								) : null}
							</ListGroup.Item>
							<ListGroup.Item>
								Ticket Price = {eventData.ticketPrice}{" "}
								{isEventCreator ? (
									<Button className="float-end btn-sm" variant="primary" type="submit">
										Edit
									</Button>
								) : null}
							</ListGroup.Item>
							<ListGroup.Item>
								Tickets per address = {eventData.ticketsPerAddress}{" "}
								{isEventCreator ? (
									<Button className="float-end btn-sm" variant="primary" type="submit">
										Edit
									</Button>
								) : null}
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
