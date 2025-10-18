import type { Metadata } from "next";
import { headers } from "next/headers";
import { Space_Mono } from "next/font/google";
import { SafeArea } from "@/providers/minikit-provider";
import { minikitConfig } from "@/minikit.config";
import "./globals.css";
import { RootProvider } from "@/providers/root-provider";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: minikitConfig.miniapp.name,
		description: minikitConfig.miniapp.description,
		other: {
			"fc:miniapp": JSON.stringify({
				version: minikitConfig.miniapp.version,
				imageUrl: minikitConfig.miniapp.heroImageUrl,
				button: {
					title: `Launch ${minikitConfig.miniapp.name}`,
					action: {
						name: `Launch ${minikitConfig.miniapp.name}`,
						type: "launch_miniapp",
					},
				},
			}),
		},
	};
}

const spaceMono = Space_Mono({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-space-mono",
});
export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersObj = await headers();
	const cookies = headersObj.get("cookie");
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${spaceMono.variable}`}>
				<RootProvider cookies={cookies}>
					<SafeArea>{children}</SafeArea>
				</RootProvider>
			</body>
		</html>
	);
}
