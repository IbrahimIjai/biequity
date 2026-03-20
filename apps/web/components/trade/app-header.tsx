"use client"

import type React from "react"

import { ArrowLeft } from "@phosphor-icons/react"
import Link from "next/link"
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi"
import { Button } from "@workspace/ui/components/button"
import { useAppKit } from "@reown/appkit/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@workspace/ui/components/dialog"
import { baseSepolia } from "@reown/appkit/networks"

export function AppHeader() {
  const { address, isConnected, isConnecting } = useAccount()
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect"
  const { connectors, connect, status } = useConnect()
  const { open } = useAppKit()
  const { disconnect, isPending: isDisconnecting } = useDisconnect()
  const chainId = useChainId()
  const networkName =
    chainId === baseSepolia.id ? baseSepolia.name : `Chain ${chainId}`

  const handleConnect = () => {
    if (isConnected) {
      return
    }

    open({ view: "Connect" })
  }
  return (
    <header className="flex-shrink-0 border-b-4 border-border">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-bold">Back</span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight">TRADE</h1>
        {isConnected ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="flex items-center gap-2 border-2 border-border font-mono text-xs shadow"
                variant="outline"
              >
                <span>{displayAddress}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-sm">
              <DialogHeader>
                <DialogTitle>Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                    <span className="font-medium">Network connected</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {networkName}
                  </div>
                </div>

                <div className="rounded border p-3 font-mono text-xs">
                  {address}
                </div>

                <div className="flex w-full gap-2">
                  <DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => disconnect()}
                      className="w-full"
                      disabled={isDisconnecting}
                    >
                      {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            onClick={handleConnect}
            size="sm"
            className="border-2 border-border font-mono text-xs shadow"
            variant="outline"
          >
            {status === "pending" || isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    </header>
  )
}
