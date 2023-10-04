// scripts/deploy.js

const hre = require("hardhat");

async function main() {
	const provider = new hre.ethers.providers.JsonRpcProvider(process.env.RPC_URL1);
	const deployer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
	console.log("Deployer address: ", deployer.address);
	console.log("Deploying contracts with the account:", deployer.address);

	// Deploy Event contract
	const Event = await hre.ethers.getContractFactory("Event");
	const event = await Event.deploy();
	await event.deployed();
	console.log("Event contract deployed to:", event.address);

	// Deploy EventProxyFactory contract
	const EventProxyFactory = await hre.ethers.getContractFactory("EventProxyFactory");
	const eventProxyFactory = await EventProxyFactory.deploy(event.address);
	await eventProxyFactory.deployed();
	console.log("EventProxyFactory contract deployed to:", eventProxyFactory.address);

	// Create a new event using the deployed EventProxyFactory contract
	const newEventTx = await eventProxyFactory.createNewEvent(
		deployer.address, // eventAdmin
		Math.floor(Date.now() / 1000), // startDate
		Math.floor(Date.now() / 1000) + 86400, // endDate (1 day later)
		"Test Event", // eventName
		"0x0000000000000000000000000000000000000000", // purchaseTokenAddress
		"0x0000000000000000000000000000000000000000", // gatingNFT
		0 // eventPlatform (assuming Zoom for example)
	);
	const receipt = await newEventTx.wait();
	const newEventAddress = receipt.events?.find((event) => event.event === "NewClone")?.args?._clone;
	console.log("New event created at address:", newEventAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
	});

