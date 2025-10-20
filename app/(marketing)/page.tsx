"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useMiniKit } from "@/providers/minikit-provider";
import { Button } from "@/components/ui/button";
import {
	ArrowRight,
	Github,
	Shield,
	TrendingUp,
	Twitter,
	Zap,
} from "lucide-react";

export default function Home() {
	// If you need to verify the user's identity, you can use the useQuickAuth hook.
	// This hook will verify the user's signature and return the user's FID. You can update
	// this to meet your needs. See the /app/api/auth/route.ts file for more details.
	// Note: If you don't need to verify the user's identity, you can get their FID and other user data
	// via `useMiniKit().context?.user`.
	// const { data, isLoading, error } = useQuickAuth<{
	//   userFid: string;
	// }>("/api/auth");

	const { setMiniAppReady, isMiniAppReady } = useMiniKit();

	useEffect(() => {
		if (!isMiniAppReady) {
			setMiniAppReady();
		}
	}, [setMiniAppReady, isMiniAppReady]);

	return (
		<main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
			{/* Header */}
			<header className="border-b-4 border-border flex-shrink-0">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-primary border-4 border-border" />
						<span className="text-xl font-bold tracking-tight">BIEQUITY</span>
					</div>
					<nav className="hidden md:flex items-center gap-6 text-sm">
						<Link
							href="/protocol"
							className="hover:text-primary transition-colors">
							Protocol
						</Link>
						<Link href="/docs" className="hover:text-primary transition-colors">
							Docs
						</Link>
					</nav>
					<Button className="shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
						Launch App
					</Button>
				</div>
			</header>

			{/* Hero Section */}
			<section className="flex-1 flex items-center justify-center px-4 overflow-y-auto">
				<div className="max-w-4xl mx-auto text-center py-8">
					<div className="inline-block mb-4 px-3 py-1 bg-primary/10 border-4 border-border">
						<span className="text-xs font-bold">BUILT ON BASE NETWORK</span>
					</div>

					<h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-balance">
						Permissionless Stock Issuance Protocol
					</h1>

					<p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
						Use stablecoins to back volatile stocks. Issue tokenized equities
						on-chain without intermediaries.
					</p>

					<div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
						<Button
							size="lg"
							className="shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
							Start Issuing <ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="border-4 shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-transparent">
							Read Whitepaper
						</Button>forge remappings
					</div>

					
					{/* How It Works */}
					<div className="grid md:grid-cols-3 gap-3 md:gap-4 mt-8 max-w-3xl mx-auto">
						<div className="bg-card p-4 border-4 border-border shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)]">
							<div className="w-10 h-10 bg-primary border-4 border-border flex items-center justify-center mb-2 mx-auto">
								<Shield className="h-5 w-5 text-primary-foreground" />
							</div>
							<h3 className="text-lg font-bold mb-1">Deposit Stables</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Lock USDC as collateral in smart contracts
							</p>
						</div>

						<div className="bg-card p-4 border-4 border-border shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)]">
							<div className="w-10 h-10 bg-primary border-4 border-border flex items-center justify-center mb-2 mx-auto">
								<Zap className="h-5 w-5 text-primary-foreground" />
							</div>
							<h3 className="text-lg font-bold mb-1">Mint Stocks</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Issue tokenized equity backed by collateral
							</p>
						</div>

						<div className="bg-card p-4 border-4 border-border shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)]">
							<div className="w-10 h-10 bg-primary border-4 border-border flex items-center justify-center mb-2 mx-auto">
								<TrendingUp className="h-5 w-5 text-primary-foreground" />
							</div>
							<h3 className="text-lg font-bold mb-1">Trade & Manage</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Trade permissionlessly or redeem for collateral
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t-4 border-border py-4 flex-shrink-0">
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 bg-primary border-4 border-border" />
							<span className="text-sm font-bold">BIEQUITY</span>
						</div>
						<div className="flex gap-4 items-center">
							<a
								href="#"
								className="hover:text-primary transition-colors"
								aria-label="Twitter">
								<Twitter className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="hover:text-primary transition-colors"
								aria-label="GitHub">
								<Github className="h-5 w-5" />
							</a>
							<a
								href="#"
								className="hover:text-primary transition-colors text-sm">
								Docs
							</a>
						</div>
					</div>
				</div>
			</footer>
		</main>
	);
}
