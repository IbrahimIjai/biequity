"use client";
import { MiniKitProvider } from "@/providers/minikit-provider";
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
						defaultTheme="light"
						enableSystem
                        forcedTheme="light"
						disableTransitionOnChange>
						{children}
					</ThemeProvider>
				</MiniKitProvider>
			</Web3ContextProvider>
		</>
	);
}
