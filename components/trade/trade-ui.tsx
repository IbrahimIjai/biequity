"use client";

import { useState } from "react";
import { useTradeStore } from "@/store/trade-store";
import { TokenSelectorDialog } from "./token-selector-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { STABLECOINS, STOCKS } from "@/lib/tokens-list";

export function SwapInterface() {
	const {
		token0,
		token1,
		amount0,
		amount1,
		setToken0,
		setToken1,
		setAmount0,
		setAmount1,
		swapTokens,
	} = useTradeStore();

	const [isLoading, setIsLoading] = useState(false);

	const handleAmount0Change = (value: string) => {
		setAmount0(value);
		if (value) {
			setAmount1((Number.parseFloat(value) * 150).toString());
		} else {
			setAmount1("");
		}
	};

	const handleSwap = async () => {
		setIsLoading(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log(
				`Swapping ${amount0} ${token0.symbol} for ${amount1} ${token1.symbol}`,
			);
		} finally {
			setIsLoading(false);
		}
	};

	const price =
		amount0 && amount1
			? (Number.parseFloat(amount1) / Number.parseFloat(amount0)).toFixed(2)
			: "0.00";
	const fee = amount0 ? (Number.parseFloat(amount0) * 0.03).toFixed(2) : "0.00";

	return (
		<>
			<div className="w-full max-w-md mx-auto">
				<Card className="border-none shadow-none bg-transparent">
					<CardContent className="p-8 ">
						{/* Token 0 Header */}
						<div className="border-2 px-2 pt-2 pb-8">
							<div className="flex items-center justify-between">
								<TokenSelectorDialog
									onSelect={setToken0}
									tokens={STABLECOINS}
									currentToken={token0}>
									<button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
										<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow border-2 border-border">
											<span className="text-xs font-bold text-background">
												{token0.symbol[0]}
											</span>
										</div>
										<div className="text-left">
											<div className="font-bold text-sm">{token0.symbol}</div>
											<div className="text-xs text-muted-foreground">
												1,234.56
											</div>
										</div>
									</button>
								</TokenSelectorDialog>
								<button
									onClick={() => setAmount0(amount0 ? "" : "1000")}
									className="text-xs font-bold border-2 border-border px-3 py-1 shadow hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
									Use Max
								</button>
							</div>

							{/* Amount Input */}
							<div className="text-center space-y-2">
								<input
									type="number"
									value={amount0}
									onChange={(e) => handleAmount0Change(e.target.value)}
									placeholder="0"
									className="w-full text-5xl font-bold text-center bg-transparent outline-none placeholder-muted-foreground"
								/>
								<div className="text-sm text-muted-foreground">
									≈ ${(Number.parseFloat(amount0 || "0") * 1.0).toFixed(2)}
								</div>
							</div>
						</div>

						{/* Divider with Swap Button */}
						<div className="flex justify-center">
							<button
								onClick={swapTokens}
								className="w-12 h-12 rounded-full border-4 border-border bg-background shadow hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center">
								<ChevronDown className="h-6 w-6 " />
							</button>
						</div>

						<div className="border-2 p-2">
							{/* Token 1 Header */}
							<div className="flex items-center justify-between">
								<TokenSelectorDialog
									onSelect={setToken1}
									tokens={STOCKS}
									currentToken={token1}>
									<button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
										<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow border-2 border-border">
											<span className="text-xs font-bold text-background">
												{token1.symbol[0]}
											</span>
										</div>
										<div className="text-left">
											<div className="font-bold text-sm">
												Receive {token1.symbol}
											</div>
											<div className="text-xs text-muted-foreground">0.00</div>
										</div>
									</button>
								</TokenSelectorDialog>
								<div className="text-right">
									<div className="text-2xl font-bold">{amount1 || "0"}</div>
								</div>
							</div>

							{/* Price & Fee Info */}
							{amount0 && amount1 && (
								<div className="mt-3 bg-muted border-2 border-border p-4 space-y-2 text-xs">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Price</span>
										<span className="font-bold">
											1 {token0.symbol} = {price} {token1.symbol}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Fee (3%)</span>
										<span className="font-bold">
											{fee} {token0.symbol}
										</span>
									</div>
								</div>
							)}
						</div>

						{/* Swap Button */}
						<Button
							onClick={handleSwap}
							disabled={!amount0 || !amount1 || isLoading}
							className="w-full mt-5 shadow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 text-base font-bold py-6"
							size="lg">
							{isLoading
								? "Swapping..."
								: `Swap ${token0.symbol} for ${token1.symbol}`}
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Dialogs are now embedded with triggers above */}
		</>
	);
}
