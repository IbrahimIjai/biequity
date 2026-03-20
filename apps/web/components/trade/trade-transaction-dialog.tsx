"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import {
  SpinnerGap,
  CheckCircle,
  X,
  ArrowRight,
  ArrowSquareOut,
} from "@phosphor-icons/react"
import { useTradeContract } from "@/hooks/useTradeContract"
import { useUSDCApproval } from "@/hooks/useUSDCApproval"
import { toast } from "sonner"

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

export interface TradeTransactionDialogProps {
  children: React.ReactNode
  token0Symbol: string
  token1Symbol: string
  amount0: string
  amount1: string
  isBuyingStock: boolean
  onSuccess?: () => void
}

type TransactionStep = "approval" | "trade" | "complete"

export function TradeTransactionDialog({
  children,
  token0Symbol,
  token1Symbol,
  amount0,
  amount1,
  isBuyingStock,
  onSuccess,
}: TradeTransactionDialogProps) {
  const { address: userAddress, isConnected } = useAccount()

  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<TransactionStep>("approval")
  const [approvalCompleted, setApprovalCompleted] = useState(false)

  const {
    buyStock,
    redeemStock,
    isLoading: isTradeLoading,
    hash: tradeHash,
    error: tradeError,
  } = useTradeContract()

  const {
    approveUSDC,
    needsApproval,
    isLoading: isApprovalLoading,
    hash: approvalHash,
    error: approvalError,
    refetchAllowance,
  } = useUSDCApproval(USDC_ADDRESS, userAddress)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep("approval")
      setApprovalCompleted(false)
      refetchAllowance()
    } else {
      setTimeout(() => {
        setCurrentStep("approval")
        setApprovalCompleted(false)
      }, 100)
    }
  }, [isOpen, refetchAllowance])

  useEffect(() => {
    if (
      isBuyingStock &&
      !needsApproval(amount0) &&
      currentStep === "approval"
    ) {
      setApprovalCompleted(true)
      setCurrentStep("trade")
    }
  }, [isBuyingStock, needsApproval, amount0, currentStep])

  useEffect(() => {
    if (approvalHash && !isApprovalLoading && !approvalError) {
      setApprovalCompleted(true)
      setCurrentStep("trade")
      toast.success("USDC Approved Successfully!", {
        description: "You can now proceed with your trade",
      })
    }
  }, [approvalHash, isApprovalLoading, approvalError])

  useEffect(() => {
    if (tradeHash && !isTradeLoading && !tradeError) {
      setCurrentStep("complete")
      toast.success("Transaction Successful!", {
        description: `${
          isBuyingStock ? "Purchase" : "Redemption"
        } completed successfully`,
        action: {
          label: "View on Explorer",
          onClick: () =>
            window.open(
              `https://sepolia.basescan.org/tx/${tradeHash}`,
              "_blank"
            ),
        },
      })
      onSuccess?.()
    }
  }, [tradeHash, isTradeLoading, tradeError, isBuyingStock, onSuccess])

  useEffect(() => {
    if (approvalError) {
      toast.error("Approval Failed", {
        description: approvalError.message || "Failed to approve USDC spending",
      })
    }
    if (tradeError) {
      toast.error("Transaction Failed", {
        description: tradeError.message || "Failed to execute trade",
      })
    }
  }, [approvalError, tradeError])

  const handleApproval = async () => {
    if (!userAddress || !isConnected) return

    try {
      await approveUSDC(amount0)
    } catch (error) {
      console.error("Approval failed:", error)
    }
  }

  const handleTrade = async () => {
    if (!userAddress || !isConnected || !amount0) return

    try {
      if (isBuyingStock) {
        await buyStock({
          symbol: token1Symbol,
          amount: amount0,
          decimals: 6,
        })
      } else {
        await redeemStock({
          symbol: token0Symbol,
          amount: amount0,
          decimals: 18,
        })
      }
    } catch (error) {
      console.error("Trade failed:", error)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && (isApprovalLoading || isTradeLoading)) {
      return
    }
    setIsOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className="w-full">
        {children}
      </DialogTrigger>
      <DialogContent className="overflow-hidden rounded-lg border border-border bg-card p-0 shadow-2xl sm:max-w-[420px]">
        <div className="flex items-center justify-between border-b border-border p-6 pb-4">
          <h2 className="font-mono text-xl font-semibold text-foreground">
            {isBuyingStock ? "Buy" : "Redeem"}{" "}
            {isBuyingStock ? token1Symbol : token0Symbol}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-sm p-2 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="mb-6 flex items-center justify-between">
            {isBuyingStock && (
              <>
                <div
                  className={`flex items-center gap-2 ${
                    currentStep === "approval"
                      ? "text-primary"
                      : approvalCompleted
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-sm border-2 transition-all duration-300 ${
                      approvalCompleted
                        ? "border-primary bg-primary shadow-sm"
                        : currentStep === "approval"
                          ? "border-primary bg-primary shadow-sm"
                          : "border-muted bg-muted"
                    }`}
                  >
                    {approvalCompleted ? (
                      <CheckCircle className="h-5 w-5 text-primary-foreground" />
                    ) : currentStep === "approval" && isApprovalLoading ? (
                      <SpinnerGap className="h-4 w-4 animate-spin text-primary-foreground" />
                    ) : (
                      <span
                        className={`font-mono text-sm font-semibold ${
                          currentStep === "approval"
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        1
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm font-medium">Approve</span>
                </div>

                <div className="relative mx-4 flex-1">
                  <div className="h-0.5 bg-muted"></div>
                  <div
                    className={`absolute top-0 left-0 h-0.5 bg-primary transition-all duration-500 ${
                      approvalCompleted ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              </>
            )}

            <div
              className={`flex items-center gap-2 ${
                currentStep === "trade"
                  ? "text-primary"
                  : currentStep === "complete"
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-sm border-2 transition-all duration-300 ${
                  currentStep === "complete"
                    ? "border-primary bg-primary shadow-sm"
                    : currentStep === "trade"
                      ? "border-primary bg-primary shadow-sm"
                      : "border-muted bg-muted"
                }`}
              >
                {currentStep === "complete" ? (
                  <CheckCircle className="h-5 w-5 text-primary-foreground" />
                ) : currentStep === "trade" && isTradeLoading ? (
                  <SpinnerGap className="h-4 w-4 animate-spin text-primary-foreground" />
                ) : (
                  <span
                    className={`font-mono text-sm font-semibold ${
                      currentStep === "trade"
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isBuyingStock ? "2" : "1"}
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-medium">Confirm</span>
            </div>
          </div>

          {currentStep !== "complete" && (
            <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="mb-1 font-mono text-sm text-muted-foreground">
                    You pay
                  </div>
                  <div className="font-mono font-semibold text-foreground">
                    {amount0} {token0Symbol}
                  </div>
                </div>
                <ArrowRight className="mx-4 h-5 w-5 text-muted-foreground" />
                <div className="text-right">
                  <div className="mb-1 font-mono text-sm text-muted-foreground">
                    You receive
                  </div>
                  <div className="font-mono font-semibold text-foreground">
                    {amount1} {token1Symbol}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "approval" &&
            isBuyingStock &&
            !approvalCompleted && (
              <Button
                onClick={handleApproval}
                disabled={isApprovalLoading}
                className="h-12 w-full rounded-sm bg-primary font-mono font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {isApprovalLoading ? (
                  <>
                    <SpinnerGap className="mr-2 h-5 w-5 animate-spin" />
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
              className="h-12 w-full rounded-sm bg-primary font-mono font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              {isTradeLoading ? (
                <>
                  <SpinnerGap className="mr-2 h-5 w-5 animate-spin" />
                  {isBuyingStock ? "Buying..." : "Redeeming..."}
                </>
              ) : (
                `Confirm ${isBuyingStock ? "Buy" : "Redeem"}`
              )}
            </Button>
          )}

          {currentStep === "complete" && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-sm border border-primary/20 bg-primary/10">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mb-2 font-mono text-lg font-semibold text-foreground">
                Transaction Successful!
              </h3>
              <p className="mb-6 font-mono text-sm text-muted-foreground">
                Your {isBuyingStock ? "purchase" : "redemption"} has been
                completed.
              </p>

              <div className="mb-6 space-y-2">
                {approvalHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${approvalHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-mono text-sm text-primary transition-colors hover:text-primary/80"
                  >
                    View Approval <ArrowSquareOut className="inline h-4 w-4" />
                  </a>
                )}
                {tradeHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${tradeHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-mono text-sm text-primary transition-colors hover:text-primary/80"
                  >
                    View Transaction{" "}
                    <ArrowSquareOut className="inline h-4 w-4" />
                  </a>
                )}
              </div>

              <Button
                onClick={() => setIsOpen(false)}
                className="h-12 w-full rounded-sm bg-secondary font-mono font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90"
                variant="secondary"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
