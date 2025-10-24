"use client";

import type React from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { useIsInMiniApp } from "@/providers/minikit-provider";
import { useAppKit } from "@reown/appkit/react";

export function AppHeader() {
	const { address, isConnected, isConnecting } = useAccount();
	const displayAddress = address
		? `${address.slice(0, 6)}...${address.slice(-4)}`
		: "Connect";
	const { isInMiniApp } = useIsInMiniApp();
	const { connectors, connect, status } = useConnect();
	const { open } = useAppKit();

	const handleConnect = () => {
		if (isConnected) {
			// When already connected, open account/Connect modal (desktop flow)
			if (!isInMiniApp) open({ view: "Connect" });
			return;
		}
		if (isInMiniApp) {
			// Mini app: connect via the first available farcaster connector
			const connector = connectors?.[0];
			if (connector && !isConnecting) connect({ connector });
			return;
		}
		// Web: open Reown modal
		open({ view: "Connect" });
	};
	return (
		<header className="border-b-4 border-border flex-shrink-0">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<Link
					href="/"
					className="flex items-center gap-2 hover:opacity-80 transition-opacity">
					<ArrowLeft className="h-5 w-5" />
					<span className="text-sm font-bold">Back</span>
				</Link>
				<h1 className="text-xl font-bold tracking-tight">TRADE</h1>
				<Button
					onClick={handleConnect}
					size="sm"
					className="text-xs font-mono border-2 border-border shadow"
					variant="outline">
					{isConnected
						? displayAddress
						: status === "pending" || isConnecting
						? "Connecting..."
						: "Connect"}
				</Button>
			</div>
		</header>
	);
}
