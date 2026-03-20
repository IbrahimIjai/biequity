"use client"

import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { ArrowLeft, Bank, ChartLineUp, ShieldCheck, ArrowSquareOut, Info } from "@phosphor-icons/react"
import Link from "next/link"

export function ProtocolUI() {
  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      
      <header className="sticky top-0 z-50 w-full flex-shrink-0 border-b-4 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link
            href="/"
            className="group flex items-center gap-2 transition-transform hover:-translate-x-1"
          >
            <div className="flex h-10 w-10 items-center justify-center border-4 border-foreground bg-primary shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)]">
              <ArrowLeft className="h-5 w-5 font-bold text-primary-foreground" />
            </div>
            <span className="hidden sm:inline text-sm font-black uppercase tracking-widest text-foreground">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocol Status</span>
              <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Operational
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      
      <section className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-12 pb-12">
          
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground md:text-6xl flex items-center gap-4">
              <span className="border-b-8 border-primary">Transparency</span> Dashboard
            </h1>
            <p className="max-w-2xl text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
              Real-time proof of backing for all issued synthetic equities. BiEquity maintains a 1:1 treasury reserve for every token minted.
            </p>
          </div>

          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="rounded-none border-4 border-foreground bg-card shadow-[0.5rem_0.5rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.5rem_0.5rem_0rem_0rem_rgba(142,255,155,0.2)]">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-primary">
                    <Bank className="h-4 w-4 text-primary-foreground" weight="bold" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Treasury Reserve</span>
                </div>
                <div className="mb-1 text-4xl font-black text-foreground">$2,450,000</div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest">100% USDC Verified</div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-4 border-foreground bg-card shadow-[0.5rem_0.5rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.5rem_0.5rem_0rem_0rem_rgba(142,255,155,0.2)]">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-foreground">
                    <ShieldCheck className="h-4 w-4 text-background" weight="bold" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">TVL Backed</span>
                </div>
                <div className="mb-1 text-4xl font-black text-foreground">$1,890,042</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">77.1% Reserved Cap</div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-4 border-foreground bg-primary shadow-[0.5rem_0.5rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.5rem_0.5rem_0rem_0rem_rgba(255,255,255,1)]">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-background">
                    <ChartLineUp className="h-4 w-4 text-foreground" weight="bold" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-primary-foreground">Protocol Revenue</span>
                </div>
                <div className="mb-1 text-4xl font-black text-primary-foreground">$42,150</div>
                <div className="text-xs font-bold text-primary-foreground/80 uppercase tracking-widest">Cumulative Fees</div>
              </CardContent>
            </Card>
          </div>

          
          <div className="space-y-6">
            <div className="flex items-end justify-between border-b-4 border-foreground pb-4">
               <h2 className="text-2xl font-black uppercase tracking-widest text-foreground italic underline decoration-primary decoration-8 underline-offset-8">Live Issued Assets</h2>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-muted-foreground bg-muted px-2 py-1 border-2 border-foreground">
                  <Info className="h-3 w-3" /> Updated block: 19,420,123
               </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              <Card className="group relative rounded-none border-4 border-foreground bg-background p-0 shadow-[0.75rem_0.75rem_0rem_0rem_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[0.75rem_0.75rem_0rem_0rem_rgba(255,255,255,1)]">
                <div className="absolute -right-4 -top-4 -rotate-3 border-4 border-foreground bg-primary px-4 py-2 text-sm font-black uppercase shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)]">
                  tsTSLA
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-5xl font-black uppercase text-foreground italic">TSLA</h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tesla, Inc. Equity</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t-4 border-foreground pt-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Minted Supply</span>
                      <div className="text-2xl font-black">12,500.00</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Backing Ratio</span>
                      <div className="text-2xl font-black text-primary flex items-center gap-2">
                        150% <ShieldCheck className="h-5 w-5" weight="fill" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase">
                      <span>Verification Status</span>
                      <span className="text-primary">Secured</span>
                    </div>
                    <div className="h-6 w-full border-4 border-foreground bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "81.6%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>$1,020,000 Backed</span>
                      <span>81.6% Coverage</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 border-4 border-foreground bg-foreground p-3 text-xs font-black uppercase text-background shadow-[0.25rem_0.25rem_0rem_0rem_rgba(142,255,155,0.4)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                      Verify Audit
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center border-4 border-foreground bg-card shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)]">
                      <ArrowSquareOut className="h-5 w-5" weight="bold" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              
              <Card className="group relative rounded-none border-4 border-foreground bg-background p-0 shadow-[0.75rem_0.75rem_0rem_0rem_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[0.75rem_0.75rem_0rem_0rem_rgba(255,255,255,1)]">
                 <div className="absolute -right-4 -top-4 rotate-3 border-4 border-foreground bg-foreground px-4 py-2 text-sm font-black uppercase text-background shadow-[0.25rem_0.25rem_0rem_0rem_rgba(142,255,155,1)]">
                  tsAAPL
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-5xl font-black uppercase text-foreground italic">AAPL</h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Apple Inc. Equity</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t-4 border-foreground pt-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Minted Supply</span>
                      <div className="text-2xl font-black">8,750.00</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Backing Ratio</span>
                      <div className="text-2xl font-black text-primary flex items-center gap-2">
                        145% <ShieldCheck className="h-5 w-5" weight="fill" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase">
                      <span>Verification Status</span>
                      <span className="text-primary">Secured</span>
                    </div>
                    <div className="h-6 w-full border-4 border-foreground bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "78.9%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>$870,000 Backed</span>
                      <span>78.9% Coverage</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 border-4 border-foreground bg-foreground p-3 text-xs font-black uppercase text-background shadow-[0.25rem_0.25rem_0rem_0rem_rgba(142,255,155,0.4)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                      Verify Audit
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center border-4 border-foreground bg-card shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)]">
                      <ArrowSquareOut className="h-5 w-5" weight="bold" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      
      <footer className="z-10 bg-muted/50 border-t-4 border-foreground p-4">
        <div className="container mx-auto max-w-6xl">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Treasury Multisig</span>
                    <span className="text-xs font-mono font-bold">0x892...F420</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Oracle Provider</span>
                    <span className="text-xs font-bold uppercase tracking-tight">Pyth Network</span>
                 </div>
              </div>
              <div className="flex items-center gap-2 border-2 border-foreground px-3 py-1 bg-background text-[10px] font-black uppercase italic">
                 Last Sync: {new Date().toLocaleTimeString()} • Base Mainnet
              </div>
           </div>
        </div>
      </footer>
    </main>
  )
}

