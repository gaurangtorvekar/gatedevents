import "bootstrap/dist/css/bootstrap.min.css";
import { AllEvents } from "@/components/AllEvents";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

function getLibrary(provider) {
	provider.on("accountsChanged", () => {
		if (typeof window !== undefined) {
			window.localStorage.removeItem("token");
		}
	});
	return new Web3Provider(provider);
}

export default function Home() {
	return (
		<div className="game container mx-auto px-4">
			<div>
				<Web3ReactProvider getLibrary={getLibrary}>
					<AllEvents />
				</Web3ReactProvider>
			</div>
		</div>
	);
}
