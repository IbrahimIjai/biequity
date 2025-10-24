"use client";
import { MiniKitProvider } from "@/providers/minikit-provider";
import { Web3ContextProvider } from "./reown-wagmi";
import { ThemeProvider } from "./theme-provider";
import { BalancesProvider } from "@/providers/balances-provider";

export function RootProvider({
	children,
	cookies,
}: {
	children: React.ReactNode;
	cookies: string | null;
}) {
	return (
		<>
			<Web3ContextProvider cookies={cookies}>
				<MiniKitProvider enabled autoConnect notificationProxyUrl={undefined}>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						enableSystem
						forcedTheme="light"
						disableTransitionOnChange>
						<BalancesProvider />
						{children}
					</ThemeProvider>
				</MiniKitProvider>
			</Web3ContextProvider>
		</>
	);
}
