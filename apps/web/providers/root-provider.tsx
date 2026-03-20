"use client";
import { Web3ContextProvider } from "./reown-wagmi";
import { ThemeProvider } from "./theme-provider";
import { DataProviders } from "@/providers/data-providers";

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
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						enableSystem
						disableTransitionOnChange>
						<DataProviders>{children}</DataProviders>
					</ThemeProvider>
			</Web3ContextProvider>
		</>
	);
}
