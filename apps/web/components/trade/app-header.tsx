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
import { ThemeToggle } from "../layout/ThemeToggle"

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
    <header className="sticky top-0 z-50 w-full flex-shrink-0 border-b-4 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 h-20">
        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center border-4 border-foreground bg-primary shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] transition-all group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)] dark:group-hover:shadow-none">
            <ArrowLeft className="h-5 w-5 font-bold text-foreground" />
          </div>
        </Link>
        <h1 className="text-2xl font-black tracking-widest uppercase text-foreground">SWAP</h1>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {isConnected ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="flex items-center gap-2 border-4 border-foreground bg-card font-mono text-xs font-black shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all h-10 sm:h-12 dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none"
                  variant="outline"
                >
                  <span>{displayAddress}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-sm border-4 border-foreground bg-background shadow-[0.5rem_0.5rem_0rem_0rem_rgba(0,0,0,1)] rounded-none dark:shadow-[0.5rem_0.5rem_0rem_0rem_rgba(255,255,255,1)]">
                <DialogHeader className="border-b-4 border-foreground pb-4">
                  <DialogTitle className="font-black uppercase tracking-widest">Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between border-4 border-foreground bg-card p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex h-3 w-3 rounded-none border-2 border-foreground bg-success animate-pulse" />
                      <span className="font-bold uppercase text-xs tracking-widest">Network</span>
                    </div>
                    <div className="text-xs font-black text-primary">
                      {networkName}
                    </div>
                  </div>

                  <div className="border-4 border-foreground bg-muted p-3 font-mono text-xs font-bold text-center break-words overflow-x-hidden">
                    {address}
                  </div>

                  <div className="flex w-full gap-2 pt-2">
                    <DialogClose className="w-full">
                      <Button
                        variant="destructive"
                        onClick={() => disconnect()}
                        className="w-full h-12 border-4 border-foreground bg-destructive text-destructive-foreground font-black tracking-widest uppercase shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-none dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none text-xs sm:text-sm"
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
              className="border-4 border-foreground bg-primary px-6 font-mono font-black text-primary-foreground shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all h-10 sm:h-12 dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] uppercase tracking-widest"
            >
              {status === "pending" || isConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
