"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useTradeContract } from "@/hooks/useTradeContract";
import { useUSDCApproval } from "@/hooks/useUSDCApproval";
import { formatDecimal } from "@/lib/utils";
import { toast } from "sonner";

// USDC contract address on Base Sepolia
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export interface TradeTransactionDialogProps {
	children: React.ReactNode;
	token0Symbol: string;
	token1Symbol: string;
	amount0: string;
	amount1: string;
	isBuyingStock: boolean;
	onSuccess?: () => void;
}

type TransactionStep = "approval" | "trade" | "complete";

export function TradeTransactionDialog({
	children,
	token0Symbol,
	token1Symbol,
	amount0,
	amount1,
	isBuyingStock,
	onSuccess,
}: TradeTransactionDialogProps) {
	const { address: userAddress, isConnected } = useAccount();
	const { disconnect } = useDisconnect();

	const [isOpen, setIsOpen] = useState(false);
	const [currentStep, setCurrentStep] = useState<TransactionStep>("approval");
	const [approvalCompleted, setApprovalCompleted] = useState(false);

	// Smart contract hooks
	const {
		buyStock,
		redeemStock,
		isLoading: isTradeLoading,
		hash: tradeHash,
		error: tradeError,
	} = useTradeContract();

	const {
		approveUSDC,
		needsApproval,
		isLoading: isApprovalLoading,
		hash: approvalHash,
		error: approvalError,
		refetchAllowance,
	} = useUSDCApproval(USDC_ADDRESS, userAddress);

	// Reset state when dialog opens/closes
	useEffect(() => {
		if (isOpen) {
			// Reset all states on open
			setCurrentStep("approval");
			setApprovalCompleted(false);
			refetchAllowance();
		} else {
			// Reset wagmi states on close
			disconnect();
			setTimeout(() => {
				// Small delay to ensure states are reset
				setCurrentStep("approval");
				setApprovalCompleted(false);
			}, 100);
		}
	}, [isOpen, disconnect, refetchAllowance]);

	// Handle step progression
	useEffect(() => {
		if (
			isBuyingStock &&
			!needsApproval(amount0) &&
			currentStep === "approval"
		) {
			setApprovalCompleted(true);
			setCurrentStep("trade");
		}
	}, [isBuyingStock, needsApproval, amount0, currentStep]);

	// Handle approval completion
	useEffect(() => {
		if (approvalHash && !isApprovalLoading && !approvalError) {
			setApprovalCompleted(true);
			setCurrentStep("trade");
			toast.success("USDC Approved Successfully!", {
				description: "You can now proceed with your trade",
			});
		}
	}, [approvalHash, isApprovalLoading, approvalError]);

	// Handle trade completion
	useEffect(() => {
		if (tradeHash && !isTradeLoading && !tradeError) {
			setCurrentStep("complete");
			toast.success("Transaction Successful!", {
				description: `${
					isBuyingStock ? "Purchase" : "Redemption"
				} completed successfully`,
				action: {
					label: "View on Explorer",
					onClick: () =>
						window.open(
							`https://sepolia.basescan.org/tx/${tradeHash}`,
							"_blank",
						),
				},
			});
			onSuccess?.();
		}
	}, [tradeHash, isTradeLoading, tradeError, isBuyingStock, onSuccess]);

	// Handle errors
	useEffect(() => {
		if (approvalError) {
			toast.error("Approval Failed", {
				description: approvalError.message || "Failed to approve USDC spending",
			});
		}
		if (tradeError) {
			toast.error("Transaction Failed", {
				description: tradeError.message || "Failed to execute trade",
			});
		}
	}, [approvalError, tradeError]);

	const handleApproval = async () => {
		if (!userAddress || !isConnected) return;

		try {
			await approveUSDC(amount0);
		} catch (error) {
			console.error("Approval failed:", error);
		}
	};

	const handleTrade = async () => {
		if (!userAddress || !isConnected || !amount0) return;

		try {
			if (isBuyingStock) {
				await buyStock({
					symbol: token1Symbol,
					amount: amount0,
					decimals: 6, // USDC decimals
				});
			} else {
				await redeemStock({
					symbol: token0Symbol,
					amount: amount0,
					decimals: 18, // Stock token decimals
				});
			}
		} catch (error) {
			console.error("Trade failed:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className="sm:max-w-[420px] p-0 bg-card border border-border shadow-2xl rounded-lg overflow-hidden"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}>
				{/* Header */}
				<div className="flex items-center justify-between p-6 pb-4 border-b border-border">
					<h2 className="text-xl font-semibold text-foreground font-mono">
						{isBuyingStock ? "Buy" : "Redeem"}{" "}
						{isBuyingStock ? token1Symbol : token0Symbol}
					</h2>
					<button
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-muted rounded-sm transition-colors">
						<XCircle className="h-5 w-5 text-muted-foreground" />
					</button>
				</div>

				{/* Progress Steps */}
				<div className="px-6 pb-6">
					<div className="flex items-center justify-between mb-6">
						{isBuyingStock && (
							<>
								{/* Approval Step */}
								<div
									className={`flex items-center gap-2 ${
										currentStep === "approval"
											? "text-primary"
											: approvalCompleted
											? "text-primary"
											: "text-muted-foreground"
									}`}>
									<div
										className={`w-8 h-8 rounded-sm border-2 flex items-center justify-center transition-all duration-300 ${
											approvalCompleted
												? "border-primary bg-primary shadow-sm"
												: currentStep === "approval"
												? "border-primary bg-primary shadow-sm"
												: "border-muted bg-muted"
										}`}>
										{approvalCompleted ? (
											<CheckCircle className="h-5 w-5 text-primary-foreground" />
										) : currentStep === "approval" && isApprovalLoading ? (
											<Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
										) : (
											<span
												className={`text-sm font-semibold font-mono ${
													currentStep === "approval"
														? "text-primary-foreground"
														: "text-muted-foreground"
												}`}>
												1
											</span>
										)}
									</div>
									<span className="text-sm font-medium font-mono">Approve</span>
								</div>

								{/* Progress Line */}
								<div className="flex-1 mx-4 relative">
									<div className="h-0.5 bg-muted"></div>
									<div
										className={`absolute top-0 left-0 h-0.5 bg-primary transition-all duration-500 ${
											approvalCompleted ? "w-full" : "w-0"
										}`}></div>
								</div>
							</>
						)}

						{/* Confirm Step */}
						<div
							className={`flex items-center gap-2 ${
								currentStep === "trade"
									? "text-primary"
									: currentStep === "complete"
									? "text-primary"
									: "text-muted-foreground"
							}`}>
							<div
								className={`w-8 h-8 rounded-sm border-2 flex items-center justify-center transition-all duration-300 ${
									currentStep === "complete"
										? "border-primary bg-primary shadow-sm"
										: currentStep === "trade"
										? "border-primary bg-primary shadow-sm"
										: "border-muted bg-muted"
								}`}>
								{currentStep === "complete" ? (
									<CheckCircle className="h-5 w-5 text-primary-foreground" />
								) : currentStep === "trade" && isTradeLoading ? (
									<Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
								) : (
									<span
										className={`text-sm font-semibold font-mono ${
											currentStep === "trade"
												? "text-primary-foreground"
												: "text-muted-foreground"
										}`}>
										{isBuyingStock ? "2" : "1"}
									</span>
								)}
							</div>
							<span className="text-sm font-medium font-mono">Confirm</span>
						</div>
					</div>

					{/* Trade Summary */}
					{currentStep !== "complete" && (
						<div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
							<div className="flex items-center justify-between">
								<div className="text-left">
									<div className="text-sm text-muted-foreground mb-1 font-mono">
										You pay
									</div>
									<div className="font-semibold text-foreground font-mono">
										{amount0} {token0Symbol}
									</div>
								</div>
								<ArrowRight className="h-5 w-5 text-muted-foreground mx-4" />
								<div className="text-right">
									<div className="text-sm text-muted-foreground mb-1 font-mono">
										You receive
									</div>
									<div className="font-semibold text-foreground font-mono">
										{amount1} {token1Symbol}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					{currentStep === "approval" &&
						isBuyingStock &&
						!approvalCompleted && (
							<Button
								onClick={handleApproval}
								disabled={isApprovalLoading}
								className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm font-semibold font-mono shadow-sm">
								{isApprovalLoading ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										Approving USDC...
									</>
								) : (
									"Approve USDC"
								)}
							</Button>
						)}

					{currentStep === "trade" && (
						<Button
							onClick={handleTrade}
							disabled={isTradeLoading}
							className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm font-semibold font-mono shadow-sm">
							{isTradeLoading ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									{isBuyingStock ? "Buying..." : "Redeeming..."}
								</>
							) : (
								`Confirm ${isBuyingStock ? "Buy" : "Redeem"}`
							)}
						</Button>
					)}

					{/* Success State */}
					{currentStep === "complete" && (
						<div className="text-center">
							<div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center mx-auto mb-4">
								<CheckCircle className="h-10 w-10 text-primary" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2 font-mono">
								Transaction Successful!
							</h3>
							<p className="text-muted-foreground mb-6 font-mono text-sm">
								Your {isBuyingStock ? "purchase" : "redemption"} has been
								completed.
							</p>

							{/* Transaction Links */}
							<div className="space-y-2 mb-6">
								{approvalHash && (
									<a
										href={`https://sepolia.basescan.org/tx/${approvalHash}`}
										target="_blank"
										rel="noopener noreferrer"
										className="block text-sm text-primary hover:text-primary/80 transition-colors font-mono">
										View Approval →
									</a>
								)}
								{tradeHash && (
									<a
										href={`https://sepolia.basescan.org/tx/${tradeHash}`}
										target="_blank"
										rel="noopener noreferrer"
										className="block text-sm text-primary hover:text-primary/80 transition-colors font-mono">
										View Transaction →
									</a>
								)}
							</div>

							<Button
								onClick={() => setIsOpen(false)}
								className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-sm font-semibold font-mono shadow-sm"
								variant="secondary">
								Close
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
