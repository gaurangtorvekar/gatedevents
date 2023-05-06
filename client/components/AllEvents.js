import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { NavBarConnect } from "./NavBarConnect";
import { event_factory_contract, event_abi, event_contract, event_factory_abi } from "@/lib/contract_config";
import { useWeb3React } from "@web3-react/core";
import { ethers, BigNumber } from "ethers";
import { useEagerConnect } from "@/utils/useEagerConnect";
import Link from "next/link";

export function AllEvents() {
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

	useEffect(() => {
		findEvents();
	}, [account]);

	return (
		<>
			<NavBarConnect />

			<div className="grid grid-cols-2 gap-4">
				{events.map((item, index) => (
					<Link href={`events/${item}`} className="no-underline flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
						<img className="object-cover w-full rounded-t-lg h-52 md:h-auto md:w-48 md:rounded-none md:rounded-l-lg" src="https://images.freeimages.com/images/large-previews/8ca/peerless-chain-1-1641825.jpg" alt="" />
						<div className="flex flex-col justify-between p-4 leading-normal">
							<h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
							<p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
						</div>
					</Link>
				))}
			</div>
		</>
	);
}
