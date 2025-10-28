"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useTradeStore } from "@/store/trade-store";
import { TokenSelectorDialog } from "./token-selector-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { STABLECOINS, STOCKS } from "@/lib/tokens-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBalancesStore } from "@/store/balances-store";
import { usePricesStore } from "@/store/prices-store";
import { useStockPrices } from "@/hooks/useStockPrices";
import { TradeTransactionDialog } from "./trade-transaction-dialog";
import { formatDecimal, formatSignificantFigures } from "@/lib/utils";

export function SwapInterface() {
	const { address: userAddress, isConnected } = useAccount();
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

	const [lastChangedField, setLastChangedField] = useState<
		"amount0" | "amount1"
	>("amount0");

	const allTokens = [...STABLECOINS, ...STOCKS];
	const tokensWithFeedId = useMemo(
		() => allTokens.filter((t) => typeof t.feedId === "string"),
		[allTokens],
	);
	useStockPrices(tokensWithFeedId);

	const { getBalance } = useBalancesStore();
	const { getPrice } = usePricesStore();

	const token0Balance =
		getBalance(token0.address ?? token0.symbol)?.formatted ?? "0";
	const token1Balance =
		getBalance(token1.address ?? token1.symbol)?.formatted ?? "0";

	const token0Price =
		getPrice(token0.symbol)?.priceUsd ?? (token0.symbol === "USDC" ? 1.0 : 0);
	const token1Price =
		getPrice(token1.symbol)?.priceUsd ?? (token1.symbol === "USDC" ? 1.0 : 0);

	const conversionRate = useMemo(() => {
		if (token0Price > 0 && token1Price > 0) {
			return token0Price / token1Price;
		}
		return 0;
	}, [token0Price, token1Price]);

	useEffect(() => {
		if (conversionRate === 0) return;

		if (lastChangedField === "amount0" && amount0) {
			const calculated = Number.parseFloat(amount0) * conversionRate;
			setAmount1(calculated > 0 ? calculated.toString() : "");
		} else if (lastChangedField === "amount1" && amount1) {
			const calculated = Number.parseFloat(amount1) / conversionRate;
			setAmount0(calculated > 0 ? calculated.toString() : "");
		}
	}, [
		conversionRate,
		amount0,
		amount1,
		lastChangedField,
		setAmount0,
		setAmount1,
	]);

	const handleAmount0Change = (value: string) => {
		setLastChangedField("amount0");
		setAmount0(value);
		if (!value) {
			setAmount1("");
		}
	};

	const handleAmount1Change = (value: string) => {
		setLastChangedField("amount1");
		setAmount1(value);
		if (!value) {
			setAmount0("");
		}
	};

	// Calculate display values and trade info
	const price =
		conversionRate > 0 ? formatDecimal(conversionRate, 4) : "0.0000";
	const fee = amount0
		? formatDecimal(Number.parseFloat(amount0) * 0.03, 6)
		: "0.00";
	const token0UsdValue = amount0 ? Number.parseFloat(amount0) * token0Price : 0;
	const token1UsdValue = amount1 ? Number.parseFloat(amount1) * token1Price : 0;

	// Determine trade type and button state
	const isBuyingStock =
		token0.symbol === "USDC" && STOCKS.some((s) => s.symbol === token1.symbol);
	const isRedeemingStock =
		STOCKS.some((s) => s.symbol === token0.symbol) && token1.symbol === "USDC";
	const isValidTrade = isBuyingStock || isRedeemingStock;

	// Button text logic
	const getButtonText = () => {
		if (!isConnected) return "Connect Wallet";
		if (!amount0 || !amount1) return "Enter Amount";
		if (!isValidTrade) return "Invalid Trade Pair";
		if (isBuyingStock) return `Buy ${token1.symbol}`;
		if (isRedeemingStock) return `Redeem ${token0.symbol}`;
		return "Trade";
	};

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
										<Avatar className="size-10 border-2 border-border shadow">
											<AvatarImage src={token0.icon} alt={token0.name} />
											<AvatarFallback className="text-xs font-bold">
												{token0.symbol[0]}
											</AvatarFallback>
										</Avatar>
										<div className="text-left">
											<div className="font-bold text-sm">{token0.symbol}</div>
											<div className="text-xs text-muted-foreground">
												Balance: {token0Balance}
											</div>
										</div>
									</button>
								</TokenSelectorDialog>
								<button
									onClick={() => setAmount0(token0Balance || "")}
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
									≈ ${formatDecimal(token0UsdValue, 2)}
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
										<Avatar className="size-10 border-2 border-border shadow">
											<AvatarImage src={token1.icon} alt={token1.name} />
											<AvatarFallback className="text-xs font-bold">
												{token1.symbol[0]}
											</AvatarFallback>
										</Avatar>
										<div className="text-left">
											<div className="font-bold text-sm">
												Receive {token1.symbol}
											</div>
											<div className="text-xs text-muted-foreground">
												Balance: {token1Balance}
											</div>
										</div>
									</button>
								</TokenSelectorDialog>
								<div className="text-right">
									<div className="text-2xl font-bold">
										{amount1
											? formatSignificantFigures(Number.parseFloat(amount1), 5)
											: "0"}
									</div>
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

						{/* Trade Button */}
						<TradeTransactionDialog
							token0Symbol={token0.symbol}
							token1Symbol={token1.symbol}
							amount0={amount0}
							amount1={amount1}
							isBuyingStock={isBuyingStock}
							onSuccess={() => {
								// Reset amounts on success
								setAmount0("");
								setAmount1("");
							}}>
							<Button
								disabled={!isConnected || !isValidTrade || !amount0 || !amount1}
								className="w-full mt-5 shadow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 text-base font-bold py-6"
								size="lg">
								{getButtonText()}
							</Button>
						</TradeTransactionDialog>

						{/* Connection Status */}
						{!isConnected && (
							<div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-200 text-xs text-yellow-800">
								<div className="flex items-center gap-2">
									<span>⚠️</span>
									<span>
										Connect your wallet to start trading tokenized stocks
									</span>
								</div>
							</div>
						)}

						{/* Trade Information */}
						{isConnected && isValidTrade && amount0 && (
							<div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 text-xs text-blue-800">
								<div className="flex items-center gap-2">
									<span>ℹ️</span>
									<span>
										{isBuyingStock
											? `Buying ${amount1} ${token1.symbol} tokens with ${amount0} USDC`
											: `Redeeming ${amount0} ${token0.symbol} tokens for ${amount1} USDC`}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Dialogs are now embedded with triggers above */}
		</>
	);
}
