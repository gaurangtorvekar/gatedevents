import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table, Form, Alert, Toast, Card } from "react-bootstrap";
import { NavBarConnect } from "./NavBarConnect";
import { event_factory_contract, event_abi, event_contract, event_factory_abi } from "@/lib/contract_config";
import { useWeb3React } from "@web3-react/core";
import { ethers, BigNumber } from "ethers";
import { useEagerConnect } from "@/utils/useEagerConnect";
import Link from "next/link";
import { useRouter } from "next/router";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { Switch } from "@headlessui/react";
import Datepicker from "react-tailwindcss-datepicker";
import Image from "next/image";

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export function CreateEventWizard() {
	const { account } = useWeb3React();
	const [events, setEvents] = useState([]);
	const [purchaseTokenDisabled, setPurchaseTokenDisabled] = useState(false);
	const [purchaseTokenValue, setPurchaseTokenValue] = useState("0xE097d6B3100777DC31B34dC2c58fB524C2e76921");
	const [ticketPriceDisabled, setTicketPriceDisabled] = useState(false);
	const [ticketPrice, setTicketPrice] = useState("10");
	const [showMinedToast, setShowMinedToast] = useState(false);
	const router = useRouter();
	const [inPerson, setInPerson] = useState(false);
	const [freeEvent, setFreeEvent] = useState(false);

	const [file, setFile] = useState(null);
	const [previewURL, setPreviewURL] = useState(null);

	const [value, setValue] = useState({
		startDate: null,
		endDate: null,
	});

	const handleValueChange = (newValue) => {
		console.log("newValue:", newValue);
		setValue(newValue);
	};

	const onFileUploadChange = (e) => {
		e.preventDefault();
		console.log("From fileuploadchange");

		const file = e.target.files?.[0];

		if (!file?.type.startsWith("image")) {
			alert("Select a valid file type");
			return;
		}

		setFile(file);
		setPreviewURL(URL.createObjectURL(file));

		e.target.value = null;
	};

	const onCancelFile = (e) => {
		e.preventDefault();
		console.log("From cancel file");
		if (!previewURL && !file) {
			return;
		}

		setFile(null);
		setPreviewURL(null);
	};

	const onUploadFile = async (e) => {
		e.preventDefault();
		console.log("From upload file");
		if (!file) {
			return;
		}

		try {
			console.log("Inside onUploadFile = ", file);
			let formData = new FormData();
			formData.append("media", file);

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const { cid } = await res.json();
			console.log("File uploaded successfully", cid);
			setFile(null);
			setPreviewURL(null);
		} catch (e) {
			console.log("Error = ", e);
		}
	};

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
					setShowMinedToast(true);
					let create_receipt = await tx.wait();
					if (create_receipt) {
						router.push("/");
					}
				}
			} else {
				console.log("Could not find ethereum object");
			}
		} catch (e) {
			console.log("Error while finding events", e);
		}
	};

	return (
		<>
			<NavBarConnect />
			{connectedOrNot ? null : (
				<Alert variant="danger" onClose={() => setShow(false)} dismissible>
					Please make sure that your Metamask is connected to <Alert.Link href="https://scroll.io/alpha">Scroll Alpha Testnet</Alert.Link> or Goerli Testnet. Please choose the correct chain on Metamask to proceed.
				</Alert>
			)}
			{showMinedToast ? (
				<Alert variant="info" dismissible>
					Please wait for the transaction to be mined. Once it is, you will be redirected to the main page.
				</Alert>
			) : null}
			<Container>
				<h4>Event creation page</h4>
				<hr />
				<Row>
					<Col md={4}>
						<Card style={{ width: "18rem" }}>
							<Card.Img variant="top" src="holder.js/100px180" />
							<Card.Body>
								<Card.Text>Upload your event visuals here</Card.Text>
								<Button variant="primary">Upload</Button>
							</Card.Body>
						</Card>
					</Col>
					<Col md={8}>
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
				</Row>
			</Container>
			<hr />
			<form onSubmit={(e) => e.preventDefault()}>
				<div className="space-y-12">
					<div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">Event</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">Information about the event itself.</p>
						</div>

						<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
							<div className="col-span-full">
								<label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
									Cover photo
								</label>
								<div className="flex flex-col md:flex-row gap-1.5 md:py-4">
									<div className="flex-grow">
										{previewURL ? (
											<div className="mx-auto w-80">
												<Image alt="file uploader preview" objectFit="cover" src={previewURL} width={320} height={218} layout="fixed" />
											</div>
										) : (
											<label className="flex flex-col items-center justify-center h-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
												<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
												</svg>
												<strong className="text-sm font-medium">Select an image</strong>
												<input className="block w-0 h-0" name="file" type="file" onChange={onFileUploadChange} />
											</label>
										)}
									</div>
									<div className="flex mt-4 md:mt-0 md:flex-col justify-center gap-1.5">
										<button disabled={!previewURL} onClick={onCancelFile} className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600">
											Cancel file
										</button>
										<button disabled={!previewURL} onClick={onUploadFile} className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600">
											Upload file
										</button>
									</div>
								</div>
								{/* <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
									<div className="text-center">
										<PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
										<div className="mt-4 flex text-sm leading-6 text-gray-600">
											<label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
												<span>Upload a file</span>
												<input id="file-upload" name="file-upload" type="file" className="sr-only" />
											</label>
											<p className="pl-1">or drag and drop</p>
										</div>
										<p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
									</div>
								</div> */}
							</div>
							<div className="sm:col-span-4">
								<label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
									Event Name
								</label>
								<div className="mt-2">
									<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
										<input id="email" name="organiserEmail" type="text" defaultValue="Hello World" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
									</div>
								</div>
							</div>
							<div className="sm:col-span-4">
								<label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
									Organiser Email address
								</label>
								<div className="mt-2">
									<input id="email" name="organiserEmail" type="email" autoComplete="email" placeholder="test@example.com" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>
							<div className="col-span-full">
								<label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900">
									Description
								</label>
								<div className="mt-2">
									<textarea id="about" name="eventDescription" placeholder="Example description" rows={3} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" defaultValue={""} />
								</div>
							</div>
							<div className="sm:col-span-3">
								<label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
									Dates
								</label>
								<div className="mt-2">
									<Datepicker primaryColor={"sky"} value={value} onChange={handleValueChange} showShortcuts={true} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">Venue</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">Information about the venue.</p>
							<Switch.Group as="div" className="flex items-center">
								<Switch checked={inPerson} onChange={setInPerson} className={classNames(inPerson ? "bg-indigo-600" : "bg-gray-200", "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2")}>
									<span aria-hidden="true" className={classNames(inPerson ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out")} />
								</Switch>
								<Switch.Label as="span" className="ml-3 text-sm">
									<span className="font-medium text-gray-900">In-person event</span>
								</Switch.Label>
							</Switch.Group>
						</div>

						<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
							<div className="sm:col-span-3">
								<label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
									Country
								</label>
								<div className="mt-2">
									<select id="country" name="country" autoComplete="country-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
										<option>United States</option>
										<option>United Kingdom</option>
										<option>Mexico</option>
									</select>
								</div>
							</div>

							<div className="col-span-full">
								<label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
									Street address
								</label>
								<div className="mt-2">
									<input type="text" name="street-address" id="street-address" autoComplete="street-address" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>

							<div className="sm:col-span-2 sm:col-start-1">
								<label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
									City
								</label>
								<div className="mt-2">
									<input type="text" name="city" id="city" autoComplete="address-level2" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>

							<div className="sm:col-span-2">
								<label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">
									State / Province
								</label>
								<div className="mt-2">
									<input type="text" name="region" id="region" autoComplete="address-level1" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>

							<div className="sm:col-span-2">
								<label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
									ZIP / Postal code
								</label>
								<div className="mt-2">
									<input type="text" name="postal-code" id="postal-code" autoComplete="postal-code" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>

							<div className="sm:col-span-4">
								<label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
									Platform
								</label>
								<div className="mt-2">
									<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
										<input type="text" name="website" id="website" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" />
									</div>
								</div>
							</div>
							<div className="sm:col-span-4">
								<label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
									Event Link
								</label>
								<div className="mt-2">
									<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
										<input type="text" name="website" id="website" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" />
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">Tickets</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">Information about the tickets.</p>
							<Switch.Group as="div" className="flex items-center">
								<Switch checked={freeEvent} onChange={setFreeEvent} className={classNames(freeEvent ? "bg-indigo-600" : "bg-gray-200", "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2")}>
									<span aria-hidden="true" className={classNames(freeEvent ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out")} />
								</Switch>
								<Switch.Label as="span" className="ml-3 text-sm">
									<span className="font-medium text-gray-900">Free event</span>
								</Switch.Label>
							</Switch.Group>
						</div>
						<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
							<div className="sm:col-span-3">
								<label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
									Number of Tickets
								</label>
								<div className="mt-2">
									<input type="text" name="first-name" id="first-name" autoComplete="given-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>

							<div className="sm:col-span-3">
								<label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
									Maximum tickets per address
								</label>
								<div className="mt-2">
									<input type="text" name="last-name" id="last-name" autoComplete="family-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>
							{freeEvent ? null : (
								<>
									<div className="sm:col-span-3">
										<label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
											Ticket Price
										</label>
										<div className="mt-2">
											<input type="text" name="first-name" id="first-name" autoComplete="given-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
										</div>
									</div>

									<div className="sm:col-span-3">
										<label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
											Purchase Token
										</label>
										<div className="mt-2">
											<input type="text" name="last-name" id="last-name" autoComplete="family-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
										</div>
									</div>
								</>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
						<div>
							<h2 className="text-base font-semibold leading-7 text-gray-900">Notifications</h2>
							<p className="mt-1 text-sm leading-6 text-gray-600">We'll always let you know about important changes, but you pick what else you want to hear about.</p>
						</div>

						<div className="max-w-2xl space-y-10 md:col-span-2">
							<fieldset>
								<legend className="text-sm font-semibold leading-6 text-gray-900">By Email</legend>
								<div className="mt-6 space-y-6">
									<div className="relative flex gap-x-3">
										<div className="flex h-6 items-center">
											<input id="comments" name="comments" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
										</div>
										<div className="text-sm leading-6">
											<label htmlFor="comments" className="font-medium text-gray-900">
												Comments
											</label>
											<p className="text-gray-500">Get notified when someones posts a comment on a posting.</p>
										</div>
									</div>
									<div className="relative flex gap-x-3">
										<div className="flex h-6 items-center">
											<input id="candidates" name="candidates" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
										</div>
										<div className="text-sm leading-6">
											<label htmlFor="candidates" className="font-medium text-gray-900">
												Candidates
											</label>
											<p className="text-gray-500">Get notified when a candidate applies for a job.</p>
										</div>
									</div>
									<div className="relative flex gap-x-3">
										<div className="flex h-6 items-center">
											<input id="offers" name="offers" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
										</div>
										<div className="text-sm leading-6">
											<label htmlFor="offers" className="font-medium text-gray-900">
												Offers
											</label>
											<p className="text-gray-500">Get notified when a candidate accepts or rejects an offer.</p>
										</div>
									</div>
								</div>
							</fieldset>
							<fieldset>
								<legend className="text-sm font-semibold leading-6 text-gray-900">Push Notifications</legend>
								<p className="mt-1 text-sm leading-6 text-gray-600">These are delivered via SMS to your mobile phone.</p>
								<div className="mt-6 space-y-6">
									<div className="flex items-center gap-x-3">
										<input id="push-everything" name="push-notifications" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
										<label htmlFor="push-everything" className="block text-sm font-medium leading-6 text-gray-900">
											Everything
										</label>
									</div>
									<div className="flex items-center gap-x-3">
										<input id="push-email" name="push-notifications" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
										<label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">
											Same as email
										</label>
									</div>
									<div className="flex items-center gap-x-3">
										<input id="push-nothing" name="push-notifications" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
										<label htmlFor="push-nothing" className="block text-sm font-medium leading-6 text-gray-900">
											No push notifications
										</label>
									</div>
								</div>
							</fieldset>
						</div>
					</div>
				</div>

				<div className="mt-6 flex items-center justify-end gap-x-6">
					<button type="button" className="text-sm font-semibold leading-6 text-gray-900">
						Cancel
					</button>
					<button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
						Save
					</button>
				</div>
			</form>
		</>
	);
}
