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
	const [uploadedURL, setUploadedURL] = useState(null);

	const [dateValue, setDateValue] = useState({
		startDate: new Date(),
		endDate: new Date(),
	});

	const handleDateValueChange = (newValue) => {
		console.log("newValue:", newValue);
		setDateValue(newValue);
	};

	const onFileUploadChange = (e) => {
		e.preventDefault();

		const file = e.target.files?.[0];
		console.log("From fileuploadchange", file.name);

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
			console.log("File uploaded successfully", `https://${cid}.ipfs.w3s.link/${file.name}`);
			setFile(null);
			setPreviewURL(null);
			setUploadedURL(`https://${cid}.ipfs.w3s.link/${file.name}`);
		} catch (e) {
			console.log("Error = ", e);
		}
	};

	const connectedOrNot = useEagerConnect();
	// console.log("Eager connect succeeded?", connectedOrNot);

	const handleFreeEvent = () => {
		setPurchaseTokenDisabled(!purchaseTokenDisabled);
		setTicketPriceDisabled(!ticketPriceDisabled);

		const newPurchaseTokenValue = purchaseTokenValue === "0xE097d6B3100777DC31B34dC2c58fB524C2e76921" ? "0x0000000000000000000000000000000000000000" : "0xE097d6B3100777DC31B34dC2c58fB524C2e76921";
		setPurchaseTokenValue(newPurchaseTokenValue);

		const newTicketPrice = ticketPrice === "10" ? "0" : "10";
		setTicketPrice(newTicketPrice);
	};

	const createEventJSON = async (jsonObject) => {
		console.log(jsonObject);
		try {
			const jsonFile = new File([JSON.stringify(jsonObject)], `${jsonObject.eventCreator}.json`, { type: "application/json" });
			const formData = new FormData();
			formData.append("media", jsonFile);
			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});
			const { cid } = await res.json();
			console.log("File uploaded successfully", `https://${cid}.ipfs.w3s.link/${jsonFile.name}`);
			return cid;
		} catch (error) {
			console.error("Error while uploading the JSON object:", error);
			throw error;
		}
	};

	const createEvent = async (e) => {
		e.preventDefault();
		console.log("Inside create events function");

		const createEventData = () => {
			console.log("Inside createEventData");
			const baseData = {
				eventName: e.target.eventName.value,
				email: e.target.organiserEmail.value,
				description: e.target.eventDescription.value,
				startDate: dateValue.startDate,
				endDate: dateValue.endDate,
				eventCreator: e.target.eventCreator.value,
				maxTickets: e.target.maxTickets.value,
				ticketsPerAddress: e.target.ticketsPerAddress.value,
				gatingNFT: e.target.gatingNFT.value,
			};

			let onlineData, inPersonData, paidData;
			if (!inPerson) {
				onlineData = {
					eventPlatform: e.target.eventPlatform.value,
					eventWebsite: e.target.eventWebsite.value,
				};
			}

			if (inPerson) {
				inPersonData = {
					country: e.target.eventCountry.value,
					eventStreet: e.target.eventStreet.value,
					eventCity: e.target.eventCity.value,
					eventState: e.target.eventState.value,
					eventPostCode: e.target.eventPostcode.value,
				};
			}

			if (!freeEvent) {
				paidData = {
					ticketPrice: e.target.ticketPrice.value,
					purchaseToken: e.target.purchaseToken.value,
				};
			}

			console.log("Base data = ", baseData);
			return {
				...baseData,
				...(inPerson ? inPersonData : onlineData),
				...(freeEvent ? {} : paidData),
			};
		};

		try {
			const { ethereum } = window;
			const data = createEventData();
			console.log(data);

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const factoryContractInstance = new ethers.Contract(event_factory_contract, event_factory_abi, signer);

				if (account) {
					const zeroAddress = "0x0000000000000000000000000000000000000000";
					const ticketPrice = freeEvent ? 0 : data.ticketPrice;
					const purchaseToken = freeEvent ? zeroAddress : data.purchaseToken;

					//TODO - change the smart contract to accept dates
					const tx = await factoryContractInstance.createNewEvent(data.eventCreator, data.ticketsPerAddress, 363, data.maxTickets, ticketPrice, data.eventName, purchaseToken, data.gatingNFT);

					console.log("New event = ", tx);
					setShowMinedToast(true);

					const createReceipt = await tx.wait();

					if (createReceipt) {
						await createEventJSON(data);
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

			<Form onSubmit={createEvent}>
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
								<div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
									{previewURL ? (
										<div className="mx-auto w-80">
											<Image alt="file uploader preview" src={previewURL} width={250} height={170} layout="intrinsic" />
										</div>
									) : (
										<div className="text-center">
											<PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
											<div className="mt-4 flex text-sm leading-6 text-gray-600">
												<label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
													<span>Select a file</span>
													<input id="file-upload" name="file" type="file" className="sr-only" onChange={onFileUploadChange} />
												</label>
												<p className="pl-1">or drag and drop</p>
											</div>
											<p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
										</div>
									)}
								</div>

								<button
									disabled={!previewURL}
									onClick={onUploadFile}
									type="button"
									className="mt-3 text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800"
								>
									Confirm
								</button>
								<button disabled={!previewURL} onClick={onCancelFile} type="button" className="mt-3 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">
									Cancel
								</button>
							</div>
							<div className="sm:col-span-4">
								<label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
									Event Name
								</label>
								<div className="mt-2">
									<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
										<input name="eventName" type="text" defaultValue="Hello World" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
									</div>
								</div>
							</div>
							<div className="sm:col-span-4">
								<label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
									Organiser Email address
								</label>
								<div className="mt-2">
									<input name="organiserEmail" type="email" autoComplete="email" placeholder="test@example.com" defaultValue="info@example.com" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>
							<div className="sm:col-span-4">
								<label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
									Organiser account
								</label>
								<div className="mt-2">
									<input name="eventCreator" type="text" defaultValue={account} placeholder="test@example.com" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>
							<div className="col-span-full">
								<label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900">
									Description
								</label>
								<div className="mt-2">
									<textarea name="eventDescription" placeholder="Example description" defaultValue="Hello world description" rows={3} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>
							<div className="sm:col-span-3">
								<label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
									Dates
								</label>
								<div className="mt-2">
									<Datepicker primaryColor={"sky"} name="eventDates" value={dateValue} displayFormat={"DD/MM/YYYY"} onChange={handleDateValueChange} showShortcuts={true} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
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
							{inPerson ? (
								<>
									<div className="sm:col-span-3">
										<label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
											Country
										</label>
										<div className="mt-2">
											<select id="country" name="eventCountry" autoComplete="country-name" defaultValue="United States" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
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
											<input type="text" name="eventStreet" defaultValue="Example road" autoComplete="street-address" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
										</div>
									</div>

									<div className="sm:col-span-2 sm:col-start-1">
										<label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
											City
										</label>
										<div className="mt-2">
											<input type="text" name="eventCity" defaultValue="Example city" autoComplete="address-level2" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
										</div>
									</div>

									<div className="sm:col-span-2">
										<label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">
											State / Province
										</label>
										<div className="mt-2">
											<input type="text" name="eventState" defaultValue="Example state" autoComplete="address-level1" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
										</div>
									</div>

									<div className="sm:col-span-2">
										<label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
											ZIP / Postal code
										</label>
										<div className="mt-2">
											<input type="text" name="eventPostcode" defaultValue="Example code" autoComplete="postal-code" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
										</div>
									</div>
								</>
							) : (
								<>
									<div className="sm:col-span-4">
										<label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
											Platform
										</label>
										<div className="mt-2">
											<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
												<input type="text" name="eventPlatform" defaultValue="Zoom" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" />
											</div>
										</div>
									</div>
									<div className="sm:col-span-4">
										<label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
											Event Link
										</label>
										<div className="mt-2">
											<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
												<input type="text" name="eventWebsite" defaultValue="https://example.com" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" />
											</div>
										</div>
									</div>
								</>
							)}
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
									Total number of Tickets
								</label>
								<div className="mt-2">
									<input type="text" name="maxTickets" defaultValue="100" autoComplete="given-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>

							<div className="sm:col-span-3">
								<label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
									Maximum tickets per address
								</label>
								<div className="mt-2">
									<input type="text" name="ticketsPerAddress" defaultValue="10" autoComplete="family-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
								</div>
							</div>
							<div className="sm:col-span-4">
								<label htmlFor="website" className="block text-sm font-medium leading-6 text-gray-900">
									Gating NFT Opensea Link
								</label>
								<div className="mt-2">
									<div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
										<input type="text" name="gatingNFT" defaultValue="0x0000000000000000000000000000000000000000" className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" />
									</div>
								</div>
							</div>
							{freeEvent ? null : (
								<>
									<div className="sm:col-span-3">
										<label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
											Ticket Price
										</label>
										<div className="mt-2">
											<input type="text" name="ticketPrice" defaultValue="10" autoComplete="given-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
										</div>
									</div>

									<div className="sm:col-span-3">
										<label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
											Purchase Token
										</label>
										<div className="mt-2">
											<input type="text" name="purchaseToken" defaultValue="0xE097d6B3100777DC31B34dC2c58fB524C2e76921" autoComplete="family-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
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
					<button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
						Save
					</button>
				</div>
			</Form>
			<hr />
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
		</>
	);
}
