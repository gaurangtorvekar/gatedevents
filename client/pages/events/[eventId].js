import { useRouter } from "next/router";
// export async function getStaticPaths() {
//
// }

// export async function getStaticProps({ params }) {
// 	const postData = await getPostData(params.id);
// 	return {
// 		props: {
// 			postData,
// 		},
// 	};
// }

export default function Position(params) {
	const router = useRouter();

	// try {
	// 	const { ethereum } = window;
	// 	if (ethereum) {
	// 		const provider = new ethers.providers.Web3Provider(ethereum);
	// 		const signer = provider.getSigner();
	// 		let nftPositionContractObj = new ethers.Contract(nftPositionManagerAddress, nftPositionManagerAbi, signer);
	// 		if (account) {
	// 			let tokenBalance = await nftPositionContractObj.balanceOf(account);
	// 			let i = 0;
	// 			let positionsArray = [];
	// 			while (i < tokenBalance) {
	// 				let tokenId = await nftPositionContractObj.tokenOfOwnerByIndex(account, i);
	// 				tokenId = tokenId.toNumber();
	// 				positionsArray.push(tokenId);
	// 				i++;
	// 			}
	// 			console.log("Positions array = ", positionsArray);
	// 			return positionsArray.map((id) => {
	// 				return {
	// 					params: {
	// 						tokenId: id,
	// 					},
	// 				};
	// 			});
	// 		}
	// 	}
	// } catch (e) {
	// 	console.log("Error while finding games", e);
	// }

	return (
		<>
			<h1>Inside {router?.query?.eventId} page</h1>
		</>
	);
}
