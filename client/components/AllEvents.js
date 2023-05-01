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

	const createEvent = async () => {
		console.log("Inside create events function");
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				let factory_contract_instance = new ethers.Contract(event_factory_contract, event_factory_abi, signer);
				if (account) {
					let tx = await factory_contract_instance.createNewEvent(account, 5, 10000, 100, 10, "Hello World", "0xE097d6B3100777DC31B34dC2c58fB524C2e76921", "0x0000000000000000000000000000000000000000");
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

			<div className="flex flex-row">
				<div className="basis-1/4 py-2">
					<h3>List of events</h3>
				</div>
				<div className="basis-3/4 grid py-2 gap-4">
					{events.map((item, index) => (
						<div key={index} className=" col-span-2 overflow-hidden rounded-lg bg-white shadow">
							<div className="px-1 py-1 sm:px-2">
								<div className="ml-4 mt-4">
									<h3 className="text-base font-semibold leading-6 text-gray-900">Job Postings</h3>
									<p className="mt-1 text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur adipisicing elit quam corrupti consectetur.</p>
									<p className="mt-1 text-sm text-gray-500">{item}</p>
								</div>
							</div>
							<div className="bg-gray-50 px-4 py-5 sm:p-6">
								<div className="ml-4 mt-4 flex-shrink-0 py-2">
									<Link href={`events/${item}`}>
										<button type="button" className="relative inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
											Details
										</button>
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}
