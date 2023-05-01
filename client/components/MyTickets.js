import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table, ListGroup } from "react-bootstrap";
import { NavBarConnect } from "./NavBarConnect";
import { event_factory_contract, event_abi, event_contract, event_factory_abi } from "@/lib/contract_config";
import { useWeb3React } from "@web3-react/core";
import { ethers, BigNumber } from "ethers";
import { useEagerConnect } from "@/utils/useEagerConnect";
import Link from "next/link";

export function MyTickets() {
	const { account } = useWeb3React();
	const [events, setEvents] = useState([]);
	const [tickets, setTickets] = useState([]);

	const connectedOrNot = useEagerConnect();
	// console.log("Eager connect succeeded?", connectedOrNot);

	const findTickets = async () => {
		console.log("Inside findTickets");
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				let factory_contract_instance = new ethers.Contract(event_factory_contract, event_factory_abi, signer);
				if (account) {
					const events = await factory_contract_instance.getOperatorEvents(account);
					console.log("Events = ", events);
					setEvents(events);

					for (const ev of events) {
						console.log(ev);
						const event_contract_instance = new ethers.Contract(ev, event_abi, signer);
						const numTickets = await event_contract_instance.balanceOf(account);
						for (let i = 0; i < numTickets; i++) {
							let tokenId = await event_contract_instance.tokenOfOwnerByIndex(account, i);
							tokenId = tokenId.toNumber();
							let tokenURI = await event_contract_instance.tokenURI(tokenId);
							console.log("TokenURI, i = ", tokenURI, i);
							setTickets((tickets) => [...tickets, tokenURI]);
						}
					}

					console.log("Tickets = ", tickets);
				}
			} else {
				console.log("Could not find ethereum object");
			}
		} catch (e) {
			console.log("Error while finding tickets", e);
		}
	};

	useEffect(() => {
		findTickets();
	}, [account]);

	return (
		<>
			<NavBarConnect />
			<h3>My Tickets Page</h3>
			<div className="grid grid-cols-3 gap-4">
				{tickets.length ? (
					<>
						<div>01</div>
						<div>02</div>
						<div>03</div>
					</>
				) : null}
			</div>
			<Container>
				<Row>
					<hr />
					<Col>
						{tickets.length > 0 ? (
							<Table striped bordered hover>
								<thead>
									<tr>
										<th>#</th>
										<th>Event Contract</th>
									</tr>
								</thead>
								<tbody>
									{tickets.map((item, index) => (
										<tr>
											<td>{index + 1}</td>
											<td>{item ? item : "NA"}</td>
										</tr>
									))}
								</tbody>
							</Table>
						) : (
							<p>Oops! You haven't created any events yet.</p>
						)}
					</Col>
					<Col></Col>
					<Col></Col>
				</Row>
			</Container>
		</>
	);
}
