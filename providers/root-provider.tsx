"use client";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { Web3ContextProvider } from "./reown-wagmi";
import { ThemeProvider } from "./theme-provider";

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
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange>
						{children}
					</ThemeProvider>
				</MiniKitProvider>
			</Web3ContextProvider>
		</>
	);
}
