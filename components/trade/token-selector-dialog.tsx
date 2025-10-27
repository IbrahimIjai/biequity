"use client";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Token } from "@/lib/tokens-list";
import { useBalancesStore } from "@/store/balances-store";
import { usePricesStore } from "@/store/prices-store";
import { useMemo } from "react";
import { useStockPrices } from "@/hooks/useStockPrices";
import { formatDecimal } from "@/lib/utils";

interface TokenSelectorDialogProps {
	onSelect: (token: Token) => void;
	tokens: readonly Token[];
	currentToken?: Token;
	children?: React.ReactNode;
}

export function TokenSelectorDialog({
	onSelect,
	tokens,
	currentToken,
	children,
}: TokenSelectorDialogProps) {
	const [open, setOpen] = React.useState(false);
	const { getBalance } = useBalancesStore();
	const { getPrice } = usePricesStore();

	// Fetch prices for tokens that have a Pyth feed id
	const tokensWithFeedId = useMemo(
		() => tokens.filter((t) => typeof t.feedId === "string"),
		[tokens],
	);
	useStockPrices(tokensWithFeedId);

	const handleSelect = (token: Token) => {
		onSelect(token);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{React.isValidElement(children) ? (
					children
				) : (
					<Button variant="ghost" className="p-0 h-auto">
						<div className="flex items-center gap-3">
							<Avatar className="size-10 border-2 border-border shadow">
								<AvatarImage
									src={currentToken?.icon}
									alt={currentToken?.name ?? "Token"}
								/>
								<AvatarFallback className="text-xs font-bold">
									{currentToken?.symbol?.[0] ?? "?"}
								</AvatarFallback>
							</Avatar>
							<div className="text-left">
								<div className="font-bold text-sm">
									{currentToken?.symbol ?? "Select"}
								</div>
								<div className="text-xs text-muted-foreground">
									Choose token
								</div>
							</div>
						</div>
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="w-full max-w-sm">
				<DialogHeader>
					<DialogTitle>Select Token</DialogTitle>
				</DialogHeader>
				<div className="mt-2 space-y-2">
					{tokens.map((token) => (
						<button
							key={token.symbol}
							onClick={() => handleSelect(token)}
							className={`w-full flex items-center gap-3 p-3 border-2 rounded transition-all hover:bg-muted ${
								currentToken?.symbol === token.symbol
									? "border-primary bg-primary/10"
									: "border-border hover:border-primary"
							}`}>
							<Avatar className="size-8 border">
								<AvatarImage src={token.icon} alt={token.name} />
								<AvatarFallback className="text-xs font-bold">
									{token.symbol[0]}
								</AvatarFallback>
							</Avatar>

							<div className="text-left flex-1">
								<div className="font-bold text-sm">{token.symbol}</div>
								<div className="text-xs text-muted-foreground">
									{token.name}
								</div>
							</div>
							<div className="flex flex-col justify-end">
								<div className="ml-auto text-right text-xs tabular-nums text-muted-foreground">
									{getBalance(token.address ?? token.symbol)?.formatted ?? "0"}
								</div>
								{token.feedId ? (
									<div className="text-[10px] text-muted-foreground">
										{(() => {
											const entry = getPrice(token.symbol);
											if (!entry || entry.priceUsd <= 0) return null;
											const formatted = formatDecimal(entry.priceUsd, 2);
											return `${formatted} ${token.symbol.toUpperCase()}/USD`;
										})()}
									</div>
								) : null}
							</div>
						</button>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
