require("@nomicfoundation/hardhat-toolbox");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const keys = process.env.PRIVATE_KEY;
const scrollUrl = "https://alpha-rpc.scroll.io/l2";

module.exports = {
	solidity: "0.8.18",
	hardhat: {
		allowUnlimitedContractSize: true,
	},
	diamondAbi: {
		// (required) The name of your Diamond ABI
		name: "DIAMOND-1-HARDHAT",
		strict: false,
	},
	etherscan: {
		apiKey: {
			polygonMumbai: process.env.MUMBAI_KEY,
			scroll: process.env.ETHERSCAN,
			arbitrumGoerli: process.env.ARBISCAN,
			fuji: process.env.SNOWTRACE,
		},
		customChains: [
			{
				network: "scroll",
				chainId: 534353,
				urls: {
					apiURL: "https://blockscout.scroll.io/api",
					browserURL: "https://blockscout.scroll.io",
				},
			},
			{
				network: "arbitrumGoerli",
				chainId: 421613,
				urls: {
					apiURL: "https://api-goerli.arbiscan.io/api",
					browserURL: "https://goerli.arbiscan.io/",
				},
			},
			{
				network: "fuji",
				chainId: 43113,
				urls: {
					apiURL: "https://api-testnet.snowtrace.io/api",
					browserURL: "https://testnet.snowtrace.io",
				},
			},
			{
				network: "polygonMumbai",
				chainId: 80001,
				urls: {
					apiURL: "https://api-testnet.polygonscan.com/api",
					browserURL: "https://mumbai.polygonscan.com/",
				},
			},
			{
				network: "mantle",
				chainId: 5000,
				urls: {
					apiURL: "https://explorer.mantle.xyz/",
					browserURL: "https://explorer.mantle.xyz/",
				},
			},
		],
	},
	networks: {
		hardhat: {
			forking: {
				url: scrollUrl,
				blockNumber: 1374325,
			},
		},
		localhost: {
			url: "http://127.0.0.1:8545/",
			accounts: [keys],
		},
		scroll: {
			url: scrollUrl,
			accounts: [keys],
		},
		taiko_testnet: {
			url: "https://rpc.test.taiko.xyz",
			chainId: 167005,
			accounts: [keys],
		},
		goerli: {
			url: "https://ethereum-goerli.publicnode.com",
			chainId: 5,
			accounts: [keys],
		},
		mumbai: {
			allowUnlimitedContractSize: true,
			gas: 2100000,
			gasPrice: 8000000000,
			gasLimit: 50000000000000,
			// url: "https://rpc-mumbai.maticvigil.com",
			// url: "https://gateway.tenderly.co/public/polygon-mumbai	",
			// url: "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78/",
			url: "https://polygon-mumbai.g.alchemy.com/v2/A1HhakaFYuT5oFTaQXweIQKBnWIG4rZq",
			accounts: [keys],
		},
		mantletest: {
			url: "https://rpc.testnet.mantle.xyz/",
			accounts: [keys], // Uses the private key from the .env file
		},
		mantle: {
			url: "https://rpc.mantle.xyz/",
			accounts: [keys], // Uses the private key from the .env file
		},
		omni: {
			url: "https://testnet-1.omni.network/",
			accounts: [keys], // Uses the private key from the .env file
		},
		arbitrumGoerli: {
			url: "https://arbitrum-goerli.blockpi.network/v1/rpc/public",
			accounts: [keys],
		},
		fuji: {
			url: "https://rpc.ankr.com/avalanche_fuji",
			accounts: [keys],
		},
		opbnbtest: {
			allowUnlimitedContractSize: true,
			gas: 2100000,
			gasPrice: 8000000000,
			gasLimit: 50000000000000,
			url: "https://opbnb-testnet-rpc.bnbchain.org",
			accounts: [keys],
		},
	},
	settings: {
		optimizer: {
			enabled: true,
			runs: 200,
		},
	},
};

