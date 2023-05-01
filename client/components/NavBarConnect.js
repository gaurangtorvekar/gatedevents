import React from "react";
import { useState, useEffect } from "react";
import { Container, NavDropdown, Nav, Navbar } from "react-bootstrap";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";
import truncateEthAddress from "truncate-eth-address";
import { ToastContainer, toast } from "react-toastify";

export function NavBarConnect() {
	const { active, account, library, connector, activate, deactivate } = useWeb3React();

	const connectWallet = async () => {
		try {
			const injected = await new InjectedConnector({
				supportedChainIds: [80001, 534353, 5],
			});
			await activate(injected);
		} catch (e) {
			console.log("Error connecting to metamask", e);
		}
	};
	const disconnectWallet = async () => {
		try {
			await deactivate();
		} catch (e) {
			console.log("Error while disconnecting metamask");
		}
	};

	return (
		<Navbar bg="light" fixed="top">
			<Container>
				<Navbar.Brand href="/">Gated Events</Navbar.Brand>
				<Nav className="justify-content-end">
					<Nav.Link href="/tickets">My Tickets</Nav.Link>
					<Nav.Link href="https://github.com/gaurangtorvekar/gatedevents" target="_blank">
						Github
					</Nav.Link>
					<Nav.Link href="/createEvent">
						<button type="button" className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
							Create
						</button>
					</Nav.Link>
					{account ? (
						<NavDropdown id="nav-dropdown-dark-example" title={truncateEthAddress(account)}>
							<NavDropdown.Item href="#action/3.1" onClick={disconnectWallet}>
								Disconnect
							</NavDropdown.Item>
						</NavDropdown>
					) : (
						<Nav.Item as="button" className="btn btn-primary btn-sm" onClick={connectWallet}>
							Connect Wallet
						</Nav.Item>
					)}
				</Nav>
			</Container>
		</Navbar>
	);
}
