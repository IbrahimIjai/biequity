"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface Token {
	symbol: string;
	name: string;
	icon: string;
	decimals: number;
}

interface TokenSelectorModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (token: Token) => void;
	tokens: Token[];
	currentToken?: Token;
}

export function TokenSelectorModal({
	isOpen,
	onClose,
	onSelect,
	tokens,
	currentToken,
}: TokenSelectorModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-sm border-4">
				<CardHeader className="flex flex-row items-center justify-between pb-3">
					<CardTitle>Select Token</CardTitle>
					<button
						onClick={onClose}
						className="p-1 hover:bg-muted rounded transition-colors">
						<X className="h-5 w-5" />
					</button>
				</CardHeader>
				<CardContent className="space-y-2">
					{tokens.map((token) => (
						<button
							key={token.symbol}
							onClick={() => {
								onSelect(token);
								onClose();
							}}
							className={`w-full flex items-center gap-3 p-3 border-2 rounded transition-all hover:bg-muted ${
								currentToken?.symbol === token.symbol
									? "border-primary bg-primary/10"
									: "border-border hover:border-primary"
							}`}>
							<span className="text-2xl">{token.icon}</span>
							<div className="text-left flex-1">
								<div className="font-bold text-sm">{token.symbol}</div>
								<div className="text-xs text-muted-foreground">
									{token.name}
								</div>
							</div>
						</button>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
