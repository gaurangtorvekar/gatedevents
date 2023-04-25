import "bootstrap/dist/css/bootstrap.min.css";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { EventDetails } from "@/components/EventDetails";
import { useRouter } from "next/router";

function getLibrary(provider) {
	provider.on("accountsChanged", () => {
		if (typeof window !== undefined) {
			window.localStorage.removeItem("token");
		}
	});
	return new Web3Provider(provider);
}

export default function EventIDPage() {
	const router = useRouter();
	return (
		<div className="game">
			<div className="game-board">
				<Web3ReactProvider getLibrary={getLibrary}>
					<EventDetails eventId={router?.query?.eventId} />
				</Web3ReactProvider>
			</div>
		</div>
	);
}
