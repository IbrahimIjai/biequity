import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

export default function ProtocolPage() {
	return (
		<main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
			{/* Header */}
			<header className="border-b-4 border-border flex-shrink-0">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-2 hover:opacity-80 transition-opacity">
						<ArrowLeft className="h-5 w-5" />
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-primary border-4 border-border" />
							<span className="text-xl font-bold tracking-tight">BIEQUITY</span>
						</div>
					</Link>
					<div className="text-sm font-bold">PROTOCOL DASHBOARD</div>
				</div>
			</header>

			{/* Main Content */}
			<section className="flex-1 overflow-y-auto px-4 py-6">
				<div className="max-w-6xl mx-auto">
					{/* Top Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
						<div className="bg-card border-4 border-border shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] p-6">
							<div className="text-sm text-muted-foreground mb-2">
								TREASURY FUNDS
							</div>
							<div className="text-3xl font-bold text-primary mb-1">
								$2,450,000
							</div>
							<div className="text-xs text-muted-foreground">USDC</div>
						</div>

						<div className="bg-card border-4 border-border shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] p-6">
							<div className="text-sm text-muted-foreground mb-2">
								TVL BACKED
							</div>
							<div className="text-3xl font-bold text-primary mb-1">
								$1,890,000
							</div>
							<div className="text-xs text-muted-foreground">
								77.1% of Treasury
							</div>
						</div>

						<div className="bg-card border-4 border-border shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] p-6">
							<div className="text-sm text-muted-foreground mb-2">
								BACKING PROCESSING
							</div>
							<div className="text-3xl font-bold text-primary mb-1">
								$560,000
							</div>
							<div className="text-xs text-muted-foreground">22.9% Pending</div>
						</div>
					</div>

					{/* Stocks Section */}
					<div className="mb-4">
						<h2 className="text-2xl font-bold mb-4">ISSUED STOCKS</h2>
					</div>

					{/* Stock Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* TSLA Card */}
						<div className="bg-card border-4 border-border shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)]">
							<div className="border-b-4 border-border p-4 bg-primary/5">
								<div className="flex items-center justify-between">
									<div>
										<div className="text-2xl font-bold">TSLA</div>
										<div className="text-xs text-muted-foreground">
											Tesla, Inc.
										</div>
									</div>
									<div className="flex items-center gap-1 text-primary">
										<TrendingUp className="h-5 w-5" />
										<span className="text-sm font-bold">+2.4%</span>
									</div>
								</div>
							</div>

							<div className="p-4 space-y-4">
								<div className="grid grid-cols-3 gap-3">
									<div>
										<div className="text-xs text-muted-foreground mb-1">
											TOTAL MINTED
										</div>
										<div className="text-lg font-bold">12,500</div>
										<div className="text-xs text-muted-foreground">tokens</div>
									</div>
									<div>
										<div className="text-xs text-muted-foreground mb-1">
											TOTAL BACKED
										</div>
										<div className="text-lg font-bold text-primary">10,200</div>
										<div className="text-xs text-muted-foreground">81.6%</div>
									</div>
									<div>
										<div className="text-xs text-muted-foreground mb-1">
											PROCESSING
										</div>
										<div className="text-lg font-bold text-primary">2,300</div>
										<div className="text-xs text-muted-foreground">18.4%</div>
									</div>
								</div>

								<div className="pt-2 border-t-2 border-border">
									<div className="flex justify-between text-xs mb-1">
										<span className="text-muted-foreground">
											Collateral Value
										</span>
										<span className="font-bold">$1,020,000 USDC</span>
									</div>
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">
											Collateral Ratio
										</span>
										<span className="font-bold">150%</span>
									</div>
								</div>

								<Button className="w-full shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
									View Details
								</Button>
							</div>
						</div>

						{/* AAPL Card */}
						<div className="bg-card border-4 border-border shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)]">
							<div className="border-b-4 border-border p-4 bg-primary/5">
								<div className="flex items-center justify-between">
									<div>
										<div className="text-2xl font-bold">AAPL</div>
										<div className="text-xs text-muted-foreground">
											Apple Inc.
										</div>
									</div>
									<div className="flex items-center gap-1 text-destructive">
										<TrendingDown className="h-5 w-5" />
										<span className="text-sm font-bold">-0.8%</span>
									</div>
								</div>
							</div>

							<div className="p-4 space-y-4">
								<div className="grid grid-cols-3 gap-3">
									<div>
										<div className="text-xs text-muted-foreground mb-1">
											TOTAL MINTED
										</div>
										<div className="text-lg font-bold">8,750</div>
										<div className="text-xs text-muted-foreground">tokens</div>
									</div>
									<div>
										<div className="text-xs text-muted-foreground mb-1">
											TOTAL BACKED
										</div>
										<div className="text-lg font-bold text-primary">6,900</div>
										<div className="text-xs text-muted-foreground">78.9%</div>
									</div>
									<div>
										<div className="text-xs text-muted-foreground mb-1">
											PROCESSING
										</div>
										<div className="text-lg font-bold text-primary">1,850</div>
										<div className="text-xs text-muted-foreground">21.1%</div>
									</div>
								</div>

								<div className="pt-2 border-t-2 border-border">
									<div className="flex justify-between text-xs mb-1">
										<span className="text-muted-foreground">
											Collateral Value
										</span>
										<span className="font-bold">$870,000 USDC</span>
									</div>
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">
											Collateral Ratio
										</span>
										<span className="font-bold">145%</span>
									</div>
								</div>

								<Button className="w-full shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
									View Details
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t-4 border-border py-3 flex-shrink-0">
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center text-xs">
						<div className="text-muted-foreground">
							Last Updated: 2 minutes ago
						</div>
						<div className="flex gap-4">
							<span className="text-muted-foreground">Base Network</span>
							<span className="text-primary font-bold">● Live</span>
						</div>
					</div>
				</div>
			</footer>
		</main>
	);
}
