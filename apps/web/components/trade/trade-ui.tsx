"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useTradeStore } from "@/store/trade-store";
import { TokenSelectorDialog } from "./token-selector-dialog";
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { ArrowsDownUp, Info, WarningCircle } from "@phosphor-icons/react";
import { STABLECOINS, STOCKS } from "@/lib/tokens-list";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { useBalancesStore } from "@/store/balances-store";
import { usePricesStore } from "@/store/prices-store";
import { useStockPrices } from "@/hooks/useStockPrices";
import { useStocksList } from "@/hooks/useStocksList";
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

	const {
		data: dynamicStocks,
		isLoading: isLoadingStocks,
		error: stocksError,
	} = useStocksList();

	const stocksList =
		dynamicStocks && dynamicStocks.length > 0 ? dynamicStocks : STOCKS;

	const allTokens = [...STABLECOINS, ...stocksList];
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

	const price =
		conversionRate > 0 ? formatDecimal(conversionRate, 4) : "0.0000";
	const fee = amount0
		? formatDecimal(Number.parseFloat(amount0) * 0.03, 6)
		: "0.00";
	const token0UsdValue = amount0 ? Number.parseFloat(amount0) * token0Price : 0;
	const token1UsdValue = amount1 ? Number.parseFloat(amount1) * token1Price : 0;

	const isBuyingStock =
		token0.symbol === "USDC" &&
		stocksList.some(
			(s: (typeof stocksList)[number]) => s.symbol === token1.symbol,
		);
	const isRedeemingStock =
		stocksList.some(
			(s: (typeof stocksList)[number]) => s.symbol === token0.symbol,
		) && token1.symbol === "USDC";
	const isValidTrade = isBuyingStock || isRedeemingStock;

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
			<div className="w-full max-w-md mx-auto my-auto py-12 flex-shrink-0">
				<Card className="border-4 border-foreground bg-background shadow-[0.5rem_0.5rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.5rem_0.5rem_0rem_0rem_rgba(255,255,255,1)] rounded-none">
					<CardContent className="p-6 sm:p-8">
						<div className="border-4 border-foreground bg-card p-4 transition-all focus-within:ring-4 ring-primary outline-none">
							<div className="flex items-center justify-between">
								<TokenSelectorDialog
									onSelect={setToken0}
									tokens={STABLECOINS}
									currentToken={token0}>
									<button className="flex items-center gap-3 bg-background border-4 border-foreground p-2 shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none">
										<Avatar className="size-8 border-2 border-foreground bg-background rounded-none">
											<AvatarImage src={token0.icon} alt={token0.name} />
											<AvatarFallback className="text-xs font-black rounded-none">
												{token0.symbol[0]}
											</AvatarFallback>
										</Avatar>
										<div className="text-left">
											<div className="font-black text-sm uppercase tracking-widest">{token0.symbol}</div>
										</div>
									</button>
								</TokenSelectorDialog>
								<div className="text-right">
									<div className="text-xs font-bold text-muted-foreground mb-2">
										Balance: <span className="text-foreground">{token0Balance}</span>
									</div>
									<button
										onClick={() => setAmount0(token0Balance || "")}
										className="text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground border-4 border-foreground px-3 py-1 shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none">
										Use Max
									</button>
								</div>
							</div>

							<div className="mt-4 flex flex-col justify-end space-y-1">
								<input
									type="number"
									value={amount0}
									onChange={(e) => handleAmount0Change(e.target.value)}
									placeholder="0.0"
									className="w-full text-3xl font-black text-right bg-transparent outline-none placeholder:text-foreground/20 py-2 border-b-4 border-transparent focus:border-foreground transition-colors"
								/>
								<div className="text-xs font-bold text-foreground text-right opacity-80">
									≈ ${formatDecimal(token0UsdValue, 2)}
								</div>
							</div>
						</div>

						<div className="relative flex justify-center -my-6 z-10">
							<button
								onClick={swapTokens}
								className="w-14 h-14 rounded-none border-4 border-foreground bg-primary text-primary-foreground shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none group">
								<ArrowsDownUp className="h-6 w-6 font-bold group-hover:rotate-180 transition-transform duration-500" />
							</button>
						</div>

						<div className="border-4 border-foreground bg-card p-4 pb-6 mt-4">
							<div className="flex items-center justify-between">
								<TokenSelectorDialog
									onSelect={setToken1}
									tokens={stocksList}
									currentToken={token1}
									isLoading={isLoadingStocks}>
									<button className="flex items-center gap-3 bg-background border-4 border-foreground p-2 shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none">
										<Avatar className="size-8 border-2 border-foreground bg-background rounded-none">
											<AvatarImage src={token1.icon} alt={token1.name} />
											<AvatarFallback className="text-xs font-black rounded-none">
												{token1.symbol[0]}
											</AvatarFallback>
										</Avatar>
										<div className="text-left">
											<div className="font-black text-sm uppercase tracking-widest">
												{token1.symbol}
											</div>
										</div>
									</button>
								</TokenSelectorDialog>
								<div className="text-right">
									<div className="text-xs font-bold text-muted-foreground mb-1">
										Balance: <span className="text-foreground">{token1Balance}</span>
									</div>
									<div className="text-3xl font-black text-foreground truncate max-w-[180px]">
										{amount1
											? formatSignificantFigures(Number.parseFloat(amount1), 5)
											: "0.0"}
									</div>
								</div>
							</div>

							{amount0 && amount1 && conversionRate > 0 && (
								<div className="mt-6 bg-muted border-t-4 border-foreground p-4 -mx-4 -mb-6 space-y-2 text-sm">
									<div className="flex justify-between items-center">
										<span className="font-black uppercase tracking-widest text-foreground/70">Rate</span>
										<span className="font-bold text-foreground">
											1 {token0.symbol} = {price} {token1.symbol}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="font-black uppercase tracking-widest text-foreground/70">Fee (3%)</span>
										<span className="font-bold text-foreground">
											{fee} {token0.symbol}
										</span>
									</div>
								</div>
							)}
						</div>

						<TradeTransactionDialog
							token0Symbol={token0.symbol}
							token1Symbol={token1.symbol}
							amount0={amount0}
							amount1={amount1}
							isBuyingStock={isBuyingStock}
							onSuccess={() => {
								setAmount0("");
								setAmount1("");
							}}>
							<Button
								disabled={!isConnected || !isValidTrade || !amount0 || !amount1}
								className="w-full mt-8 bg-primary text-primary-foreground border-4 border-foreground shadow-[0.35rem_0.35rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:shadow-[0.35rem_0.35rem_0rem_0rem_rgba(0,0,0,0.5)] text-xl font-black uppercase tracking-widest py-8 rounded-none dark:shadow-[0.35rem_0.35rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none"
								size="lg">
								{getButtonText()}
							</Button>
						</TradeTransactionDialog>

						{!isConnected && (
							<div className="mt-6 p-4 bg-muted border-4 border-foreground shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] text-sm font-bold dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)]">
								<div className="flex items-center gap-3">
									<WarningCircle className="h-6 w-6 text-primary animate-pulse" weight="fill" />
									<span className="uppercase tracking-widest leading-relaxed">
										Connect your wallet to start trading
									</span>
								</div>
							</div>
						)}

						{isConnected && isValidTrade && !!amount0 && (
							<div className="mt-6 p-4 bg-primary/10 border-4 border-foreground shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] text-sm font-bold dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)]">
								<div className="flex items-center gap-3">
									<Info className="h-6 w-6 text-primary" weight="fill" />
									<span className="uppercase tracking-widest leading-relaxed">
										{isBuyingStock
											? `Buying ${formatDecimal(Number(amount1), 4)} ${token1.symbol} with ${formatDecimal(Number(amount0), 2)} USDC`
											: `Redeeming ${formatDecimal(Number(amount0), 4)} ${token0.symbol} for ${formatDecimal(Number(amount1), 2)} USDC`}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
