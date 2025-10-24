import type React from "react";
import type { Metadata } from "next";
import { AppHeader } from "@/components/trade/app-header";



export const metadata: Metadata = {
	title: "BiEquity - Permissionless Stock Issuance on Base",
	description:
		"The reverse MakerDAO. Use stablecoins to back volatile stocks. Issue tokenized equities on-chain without intermediaries."
        
};

export default function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<AppHeader />
			{children}
		</>
	);
}
