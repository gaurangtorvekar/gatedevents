require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.2",
	networks: {
		mumbai: {
			url: process.env.ALCHEMY_MUMBAI_URL,
			accounts: [process.env.ACCOUNT_KEY],
		},
	},
	etherscan: {
		apiKey: process.env.POLY_API_KEY,
	},
};
