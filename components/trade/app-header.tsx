"use client";

import type React from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";



export function AppHeader() {
	const { address } = useAccount();
	const displayAddress = `${address?.slice(0, 6)}...${address?.slice(-4)}`;
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
				<div className="text-xs font-mono border-2 border-border px-3 py-2 shadow">
					{displayAddress}
				</div>
			</div>
		</header>
	);
}
