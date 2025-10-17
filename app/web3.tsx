"use client";
import { ReactNode, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base } from "wagmi/chains";

// Minimal wagmi config you fully control. Adjust chains/transports/connectors as needed.
export const wagmiConfig = createConfig({
	chains: [base],
	transports: {
		[base.id]: http(), // Optionally pass a custom RPC via http(process.env.NEXT_PUBLIC_RPC_URL)
	},
	// connectors: [...] // Bring your own connectors (e.g., Reown, WalletConnect, Injected, etc.)
});

export function Web3Provider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	);
}
