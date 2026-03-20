"use client";

import type React from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { useIsInMiniApp } from "@/providers/minikit-provider";
import { useAppKit } from "@reown/appkit/react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { baseSepolia } from "@reown/appkit/networks";

export function AppHeader() {
	const { address, isConnected, isConnecting } = useAccount();
	const displayAddress = address
		? `${address.slice(0, 6)}...${address.slice(-4)}`
		: "Connect";
	const { isInMiniApp } = useIsInMiniApp();
	const { connectors, connect, status } = useConnect();
	const { open } = useAppKit();
	const { disconnect, isPending: isDisconnecting } = useDisconnect();
	const chainId = useChainId();
	const networkName =
		chainId === baseSepolia.id ? baseSepolia.name : `Chain ${chainId}`;

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
				{isConnected ? (
					<Dialog>
						<DialogTrigger asChild>
							<Button
								size="sm"
								className="text-xs font-mono border-2 border-border shadow flex items-center gap-2"
								variant="outline">
								<span>{displayAddress}</span>
							</Button>
						</DialogTrigger>
						<DialogContent className="w-full max-w-sm">
							<DialogHeader>
								<DialogTitle>Wallet</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-sm">
										<span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
										<span className="font-medium">Network connected</span>
									</div>
									<div className="text-xs text-muted-foreground">
										{networkName}
									</div>
								</div>

								<div className="rounded border p-3 text-xs font-mono">
									{address}
								</div>

								<div className="flex gap-2 w-full">
									<DialogClose asChild>
										<Button
											variant="destructive"
											onClick={() => disconnect()}
											className="w-full"
											disabled={isDisconnecting}>
											{isDisconnecting ? "Disconnecting..." : "Disconnect"}
										</Button>
									</DialogClose>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				) : (
					<Button
						onClick={handleConnect}
						size="sm"
						className="text-xs font-mono border-2 border-border shadow"
						variant="outline">
						{status === "pending" || isConnecting ? "Connecting..." : "Connect"}
					</Button>
				)}
			</div>
		</header>
	);
}
