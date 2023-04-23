import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { NavBarConnect } from "./NavBarConnect";
import { event_factory_contract, event_abi, event_contract, event_factory_abi } from "@/lib/contract_config";
import { useWeb3React } from "@web3-react/core";
import { ethers, BigNumber } from "ethers";
import { useEagerConnect } from "@/utils/useEagerConnect";
import Link from "next/link";

export function CreateEvent() {
	const { account } = useWeb3React();
	const [events, setEvents] = useState([]);

	const connectedOrNot = useEagerConnect();
	// console.log("Eager connect succeeded?", connectedOrNot);

	const findEvents = async () => {
		console.log("Inside findEvents");
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				let factory_contract_instance = new ethers.Contract(event_factory_contract, event_factory_abi, signer);
				if (account) {
					let tx = await factory_contract_instance.getOperatorEvents(account);
					console.log("Events = ", tx);
					setEvents(tx);
				}
			} else {
				console.log("Could not find ethereum object");
			}
		} catch (e) {
			console.log("Error while finding events", e);
		}
	};

	const createEvent = async () => {
		console.log("Inside create events function");
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				let factory_contract_instance = new ethers.Contract(event_factory_contract, event_factory_abi, signer);
				if (account) {
					let tx = await factory_contract_instance.createNewEvent(account, 5, 10000, 100, 101010, "Hello World", "0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF", "0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF");
					console.log("New event = ", tx);
				}
			} else {
				console.log("Could not find ethereum object");
			}
		} catch (e) {
			console.log("Error while finding events", e);
		}
	};

	useEffect(() => {
		findEvents();
	}, [account]);

	return (
		<>
			<NavBarConnect />
			<Container>
				<Row>
					<Col md={4}>Create a new Event</Col>
					<Col md={4}>
						<Button variant="outline-primary" onClick={createEvent}>
							Create
						</Button>{" "}
					</Col>
					<Col md={4}></Col>
				</Row>
				<hr />
				<Row>
					<Col>
						{events.length > 0 ? (
							<Table striped bordered hover>
								<thead>
									<tr>
										<th>#</th>
										<th>Event Contract</th>
									</tr>
								</thead>
								<tbody>
									{events.map((item, index) => (
										<tr key={index}>
											<td>{index + 1}</td>

											<td>
												<Link href={`events/${item}`}>{item}</Link>
											</td>
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
