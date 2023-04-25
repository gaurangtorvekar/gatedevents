const hre = require("hardhat");

async function main() {
	const Event = await ethers.getContractFactory("Event");
	const event = await Event.deploy();
	await event.deployed();

	// const EventProxyFactory = await ethers.getContractFactory("EventProxyFactory");
	// const epf = await EventProxyFactory.deploy(event.address);
	// await epf.deployed();

	// // const proxyFactory = await EventProxyFactory.attach(epf.deployed());
	// // await proxyFactory.createNewEvent("0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF", 10, 1000000, 100, 1938, "Hello World", "0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF", "0xfA205A82715F144096B75Ccc4C543A8a2D4CcfaF");

	console.log(event.address, "Event base contract address");
	// console.log(epf.address, "Minimal Proxy Event Factory contract address");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
