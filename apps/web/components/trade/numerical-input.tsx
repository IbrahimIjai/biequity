"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"

interface Token {
  symbol: string
  name: string
  icon: string
  decimals: number
}

interface TokenInputProps {
  token: Token
  amount: string
  onAmountChange: (amount: string) => void
  onTokenClick: () => void
  label: string
  balance?: string
  isLoading?: boolean
}

export function TokenInput({
  token,
  amount,
  onAmountChange,
  onTokenClick,
  label,
  balance,
  isLoading,
}: TokenInputProps) {
  return (
    <Card className="border-4">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-bold text-muted-foreground uppercase">
            {label}
          </label>
          {balance && (
            <div className="text-xs text-muted-foreground">
              Balance: {balance}
            </div>
          )}
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0"
              disabled={isLoading}
              className="w-full bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>

          <Button
            onClick={onTokenClick}
            variant="outline"
            className="border-2 bg-transparent whitespace-nowrap shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <span className="mr-2 text-xl">{token.icon}</span>
            {token.symbol}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
