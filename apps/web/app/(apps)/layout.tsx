import type React from "react";
import type { Metadata } from "next";
import { AppHeader } from "@/components/trade/app-header";

export const metadata: Metadata = {
	title: "BiEquity - Permissionless Stock Issuance on Base",
	description:
		"The reverse MakerDAO. Use stablecoins to back volatile stocks. Issue tokenized equities on-chain without intermediaries.",
};

export default function AppLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
			<AppHeader />
			<section className="flex-1 w-full overflow-y-auto px-4 flex flex-col">
				{children}
			</section>
			<footer className="border-t-4 border-border py-4 flex-shrink-0">
				<div className="container mx-auto px-4">
					<div className="text-center text-xs text-muted-foreground">
						Connected to Base Network • 3% Protocol Fee
					</div>
				</div>
			</footer>
		</main>
	);
}
