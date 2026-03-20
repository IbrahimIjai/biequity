"use client"

import { useState, useEffect, useCallback } from "react"
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
  Clock,
} from "@phosphor-icons/react"
import { useTradeContract } from "@/hooks/useTradeContract"
import { useUSDCApproval } from "@/hooks/useUSDCApproval"
import { toast } from "sonner"
import { SETTLEMENT_EXECUTE_ENDPOINT } from "@/config/api"

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

// Added "settling" step — shows after on-chain buy completes, before worker settles
type TransactionStep = "approval" | "trade" | "complete" | "settling"

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
  const [settlementStatusText, setSettlementStatusText] = useState<string>("")

  const {
    buyStock,
    redeemStock,
    reset: resetTradeState,
    isLoading: isTradeLoading,
    hash: tradeHash,
    error: tradeError,
  } = useTradeContract()

  const {
    approveUSDC,
    needsApproval,
    reset: resetApprovalState,
    isLoading: isApprovalLoading,
    hash: approvalHash,
    error: approvalError,
    refetchAllowance,
  } = useUSDCApproval(USDC_ADDRESS, userAddress)

  const resetDialogState = useCallback(() => {
    setCurrentStep("approval")
    setApprovalCompleted(false)
    setSettlementStatusText("")
    resetApprovalState()
    resetTradeState()
  }, [resetApprovalState, resetTradeState])

  useEffect(() => {
    if (isOpen) {
      resetDialogState()
      refetchAllowance()
    } else {
      setTimeout(() => {
        resetDialogState()
      }, 100)
    }
  }, [isOpen, refetchAllowance, resetDialogState])

  useEffect(() => {
    // If buying: auto-skip approval if allowance is already enough
    if (
      isOpen &&
      isBuyingStock &&
      !needsApproval(amount0) &&
      currentStep === "approval"
    ) {
      setCurrentStep("trade")
      setApprovalCompleted(true)
    }
    // If selling: auto-skip to trade step immediately
    if (isOpen && !isBuyingStock && currentStep === "approval") {
      setCurrentStep("trade")
      setApprovalCompleted(true)
    }
  }, [isOpen, isBuyingStock, needsApproval, amount0, currentStep, resetDialogState])

  useEffect(() => {
    if (approvalHash && !isApprovalLoading && !approvalError) {
      setApprovalCompleted(true)
      setCurrentStep("trade")
      toast.success("USDC Approved", {
        description: "You can now proceed with your trade",
      })
    }
  }, [approvalHash, isApprovalLoading, approvalError])

  useEffect(() => {
    if (tradeHash && !isTradeLoading && !tradeError && currentStep === "trade") {
      if (isBuyingStock) {
        // For buys: show "settling" step — the Cloudflare Worker needs to purchase
        // real shares and call settleTokens() on-chain. This typically takes 30–60s.
        setCurrentStep("settling")
        toast.success("Transaction Confirmed", {
          description: "Your shares are being purchased in the background.",
        })
        onSuccess?.()
      } else {
        setCurrentStep("complete")
        toast.success("Redemption Complete", {
          description: "USDC has been transferred to your wallet.",
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
    }
  }, [
    tradeHash,
    isTradeLoading,
    tradeError,
    isBuyingStock,
    onSuccess,
    currentStep,
  ])

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

  useEffect(() => {
    if (
      !isBuyingStock ||
      currentStep !== "settling" ||
      !tradeHash
    ) {
      return
    }

    let cancelled = false

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    const runSettlementPolling = async () => {
      const maxPolls = 12
      const pollDelayMs = 5000

      for (let i = 0; i < maxPolls; i++) {
        if (cancelled) return

        try {
          const response = await fetch(SETTLEMENT_EXECUTE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ txHash: tradeHash }),
          })

          const data = await response.json().catch(() => ({}))
          const status = String(data?.status ?? "unknown")
          console.log("[settlement] poll", {
            poll: i + 1,
            txHash: tradeHash,
            endpoint: SETTLEMENT_EXECUTE_ENDPOINT,
            statusCode: response.status,
            status,
            data,
          })

          if (cancelled) return
          setSettlementStatusText(status)

          if (
            response.ok &&
            (status === "settled" ||
              status === "already_settled" ||
              status === "settled_mock")
          ) {
            setCurrentStep("complete")
            toast.success("Settlement Complete", {
              description: "Your backed stock position is now settled on-chain.",
            })
            return
          }

          if (status === "order_failed") {
            toast.error("Settlement Failed", {
              description: "Worker reported order failure. Please retry shortly.",
            })
            return
          }
        } catch (error) {
          console.error("[settlement] request failed", error)
          if (cancelled) return
          setSettlementStatusText("request_failed")
        }

        if (i < maxPolls - 1) {
          await sleep(pollDelayMs)
        }
      }

      if (!cancelled) {
        toast.info("Settlement Still Pending", {
          description: "Background settlement is still in progress. Check back shortly.",
        })
      }
    }

    void runSettlementPolling()

    return () => {
      cancelled = true
    }
  }, [isBuyingStock, currentStep, tradeHash])

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
        await buyStock({ symbol: token1Symbol, amount: amount0, decimals: 6 })
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
    if (!open && (isApprovalLoading || isTradeLoading)) return
    if (!open) {
      resetDialogState()
    }
    setIsOpen(open)
  }

  // ─── Step tracker helpers ──────────────────────────────────────────────────

  const stepDone = (step: number) => {
    if (isBuyingStock) {
      if (step === 1) return approvalCompleted
      if (step === 2)
        return currentStep === "settling" || currentStep === "complete"
      if (step === 3) return false // settling never "completes" in the UI (it's async)
    } else { // Redemption flow
      if (step === 1) return currentStep === "complete"
      if (step === 2) return currentStep === "complete"
    }
    return false
  }

  const stepActive = (step: number) => {
    if (isBuyingStock) {
      if (step === 1) return currentStep === "approval"
      if (step === 2) return currentStep === "trade"
      if (step === 3) return currentStep === "settling"
    } else { // Redemption flow
      if (step === 1) return currentStep === "trade"
      if (step === 2) return currentStep === "complete"
    }
    return false
  }

  const StepCircle = ({
    step,
    label,
    icon,
  }: {
    step: number
    label: string
    icon?: React.ReactNode
  }) => (
    <div
      className={`flex items-center gap-2 ${
        stepActive(step)
          ? "text-primary"
          : stepDone(step)
            ? "text-primary"
            : "text-muted-foreground"
      }`}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-sm border-2 transition-all duration-300 ${
          stepDone(step)
            ? "border-primary bg-primary shadow-sm"
            : stepActive(step)
              ? "border-primary bg-primary shadow-sm"
              : "border-muted bg-muted"
        }`}
      >
        {stepDone(step) ? (
          <CheckCircle className="h-5 w-5 text-primary-foreground" />
        ) : stepActive(step) && (isApprovalLoading || isTradeLoading) ? (
          <SpinnerGap className="h-4 w-4 animate-spin text-primary-foreground" />
        ) : icon ? (
          icon
        ) : (
          <span
            className={`font-mono text-sm font-semibold ${
              stepActive(step)
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {step}
          </span>
        )}
      </div>
      <span className="font-mono text-sm font-medium">{label}</span>
    </div>
  )

  const Connector = ({ filled }: { filled: boolean }) => (
    <div className="relative mx-4 flex-1">
      <div className="h-0.5 bg-muted" />
      <div
        className={`absolute top-0 left-0 h-0.5 bg-primary transition-all duration-500 ${
          filled ? "w-full" : "w-0"
        }`}
      />
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className="w-full">
        {children}
      </DialogTrigger>
      <DialogContent className="overflow-hidden rounded-lg border border-border bg-card p-0 shadow-2xl sm:max-w-[440px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 pb-4">
          <h2 className="font-mono text-xl font-semibold text-foreground">
            {isBuyingStock ? "Buy" : "Redeem"}{" "}
            {isBuyingStock ? token1Symbol : token0Symbol}
          </h2>
          <button
            onClick={() => handleOpenChange(false)}
            className="rounded-sm p-2 transition-colors hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-6">
          {/* Step Tracker */}
          <div className="mb-6 flex items-center justify-between">
            {isBuyingStock ? (
              <>
                <StepCircle step={1} label="Approve" />
                <Connector filled={approvalCompleted} />
                <StepCircle step={2} label="Confirm" />
                <Connector filled={stepDone(2)} />
                <StepCircle
                  step={3}
                  label="Settle"
                  icon={
                    <Clock
                      className={`h-4 w-4 ${
                        stepActive(3)
                          ? "animate-pulse text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  }
                />
              </>
            ) : (
              <>
                <StepCircle step={1} label="Redeem" />
                <Connector filled={stepDone(1)} />
                <StepCircle step={2} label="Complete" />
              </>
            )}
          </div>

          {/* Trade summary */}
          {currentStep !== "settling" && currentStep !== "complete" && (
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

          {/* Approval step */}
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

          {/* Trade step */}
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

          {/* Settling state — shown for buy trades after on-chain confirmation */}
          {currentStep === "settling" && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-sm border border-amber-500/20 bg-amber-500/10">
                <SpinnerGap className="h-10 w-10 animate-spin text-amber-500" />
              </div>
              <h3 className="mb-2 font-mono text-lg font-semibold text-foreground">
                Pending Settlement
              </h3>
              <p className="mb-4 font-mono text-sm leading-relaxed text-muted-foreground">
                Transaction pending. Please wait 10-30 seconds for settlement.
              </p>
              <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-left">
                {settlementStatusText ? (
                  <p className="mt-2 font-mono text-[11px] text-amber-700 dark:text-amber-300">
                    Status: {settlementStatusText}
                  </p>
                ) : null}
              </div>
              {tradeHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${tradeHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 block font-mono text-sm text-primary transition-colors hover:text-primary/80"
                >
                  View Transaction <ArrowSquareOut className="inline h-4 w-4" />
                </a>
              )}
              <Button
                onClick={() => handleOpenChange(false)}
                variant="secondary"
                className="h-12 w-full rounded-sm font-mono font-semibold"
              >
                Close
              </Button>
            </div>
          )}

          {/* Complete state — for redeems */}
          {currentStep === "complete" && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-sm border border-primary/20 bg-primary/10">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mb-2 font-mono text-lg font-semibold text-foreground">
                {isBuyingStock ? "Settlement Complete" : "Redemption Complete"}
              </h3>
              <p className="mb-6 font-mono text-sm text-muted-foreground">
                {isBuyingStock
                  ? "Your stock position is now settled and backed."
                  : "USDC has been transferred to your wallet."}
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
                onClick={() => handleOpenChange(false)}
                variant="secondary"
                className="h-12 w-full rounded-sm font-mono font-semibold"
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
