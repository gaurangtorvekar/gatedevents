import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { NavBarConnect } from "./NavBarConnect";
import { event_factory_contract, event_abi, event_contract, event_factory_abi } from "@/lib/contract_config";
import { useWeb3React } from "@web3-react/core";
import { ethers, BigNumber } from "ethers";
import { useEagerConnect } from "@/utils/useEagerConnect";
import Link from "next/link";
import { BuildingOfficeIcon, CreditCardIcon, UserIcon, UsersIcon } from "@heroicons/react/20/solid";

const tabs = [
	{ name: "Upcoming", href: "#", current: true },
	{ name: "Past", href: "#", current: false },
];

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export function AllEvents() {
	const { account } = useWeb3React();
	const [events, setEvents] = useState([]);
	const [selectedTab, setSelectedTab] = useState("Upcoming");

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

			<div>
				<div className="sm:hidden">
					<label htmlFor="tabs" className="sr-only">
						Select a tab
					</label>
					<select id="tabs" name="tabs" className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" defaultValue={tabs.find((tab) => tab.current).name} onChange={(e) => setSelectedTab(e.target.value)}>
						{tabs.map((tab) => (
							<option key={tab.name}>{tab.name}</option>
						))}
					</select>
				</div>
				<div className="hidden sm:block">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex no-underline" aria-label="Tabs">
							{tabs.map((tab) => (
								<a
									key={tab.name}
									href="#"
									onClick={(e) => {
										e.preventDefault();
										setSelectedTab(tab.name);
									}}
									className={classNames(tab.current ? "border-indigo-500 text-indigo-600 no-underline" : "border-transparent no-underline text-gray-500 hover:border-gray-300 hover:text-gray-700", "w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium")}
									aria-current={tab.current ? "page" : undefined}
								>
									{tab.name}
								</a>
							))}
						</nav>
					</div>
				</div>
				{selectedTab === "Upcoming" && (
					<div className="grid grid-cols-2 gap-4">
						{events.map((item, index) => (
							<Link href={`events/${item}`} className="no-underline break-all flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
								<img className="object-cover w-full rounded-t-lg h-52 md:h-auto md:w-48 md:rounded-none md:rounded-l-lg" src="https://images.freeimages.com/images/large-previews/8ca/peerless-chain-1-1641825.jpg" alt="" />
								<div className="flex flex-col justify-between p-4 leading-normal">
									<h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
									<p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</>
	);
}
