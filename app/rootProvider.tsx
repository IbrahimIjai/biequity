"use client";
import { ReactNode } from "react";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import "@coinbase/onchainkit/styles.css";
import { Web3Provider } from "./web3";

export function RootProvider({ children }: { children: ReactNode }) {
	return (
		<Web3Provider>
			<MiniKitProvider enabled autoConnect notificationProxyUrl={undefined}>
				{children}
			</MiniKitProvider>
		</Web3Provider>
	);
}
