"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import {
  ArrowRight,
  GithubLogo,
  Shield,
  TrendUp,
  TwitterLogo,
  Lightning,
  Bank,
  CheckCircle,
  Coins,
  ArrowsLeftRight,
  Sparkle
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"

function AssetEngineAnimation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 4)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative mx-auto max-w-4xl p-4 sm:p-8">
      {/* Background brutalist accents */}
      <div className="absolute -left-4 -top-4h-full w-full bg-primary/20 border-4 border-foreground hidden sm:block"></div>
      
      <div className="relative border-4 border-foreground bg-card shadow-[0.5rem_0.5rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.5rem_0.5rem_0rem_0rem_rgba(255,255,255,1)] p-6 sm:p-10">
        
        <div className="mb-8 flex items-center justify-between border-b-4 border-foreground pb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse bg-primary border-2 border-foreground rounded-full"></div>
            <span className="text-sm font-black uppercase tracking-widest text-foreground">Live Minting Engine</span>
          </div>
          <div className="hidden sm:block border-2 border-foreground bg-primary/20 px-3 py-1">
            <span className="text-xs font-bold uppercase">Status: {step === 3 ? "Complete" : "Processing"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Step 0: User Deposit */}
          <div className={`relative border-4 border-foreground p-6 transition-all duration-300 ${step >= 0 ? "bg-background shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] opacity-100" : "opacity-30"}`}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center border-4 border-foreground bg-primary">
              <Coins className="h-6 w-6 text-primary-foreground" />
            </div>
            <h4 className="mb-2 font-black uppercase">1. User Deposit</h4>
            <p className="text-xs font-medium text-muted-foreground">User locks USDC collateral in smart contracts.</p>
            {step === 0 && (
              <div className="absolute -bottom-4 right-4 animate-bounce-in border-4 border-foreground bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                Deposit +1000 USDC
              </div>
            )}
          </div>

          {/* Connect 0 -> 1 */}
          <div className="hidden items-center justify-center md:flex">
            <ArrowsLeftRight className={`h-8 w-8 transition-colors duration-300 ${step >= 1 ? "text-primary animate-pulse" : "text-muted"}`} />
          </div>

          {/* Step 1: Partner Bank */}
          <div className={`relative border-4 border-foreground p-6 transition-all duration-300 ${step >= 1 ? "bg-background shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] opacity-100 scale-105" : "bg-card opacity-50"}`}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center border-4 border-foreground bg-foreground">
              <Bank className="h-6 w-6 text-background" />
            </div>
            <h4 className="mb-2 font-black uppercase">2. Partner Custody</h4>
            <p className="text-xs font-medium text-muted-foreground">Real-world stock equivalent purchased & locked by Institutional Partner.</p>
            {step === 1 && (
              <div className="absolute -top-4 right-4 animate-bounce-in border-4 border-foreground bg-foreground px-2 py-1 text-xs font-bold text-background">
                Locking Asset...
              </div>
            )}
            {step > 1 && (
              <div className="absolute -top-4 right-4 flex items-center gap-1 border-4 border-foreground bg-background px-2 py-1 text-xs font-bold text-foreground">
                <CheckCircle weight="fill" className="text-primary" /> Secured
              </div>
            )}
          </div>

          {/* Connect 1 -> 2 */}
          <div className="hidden items-center justify-center md:flex">
             <ArrowsLeftRight className={`h-8 w-8 transition-colors duration-300 ${step >= 2 ? "text-primary animate-pulse" : "text-muted"}`} />
          </div>

          {/* Step 2: Mint Generation */}
          <div className={`relative border-4 border-foreground p-6 transition-all duration-300 ${step >= 2 ? "bg-primary shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] opacity-100" : "bg-card opacity-50"}`}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center border-4 border-foreground bg-background">
              <Sparkle className="h-6 w-6 text-foreground" />
            </div>
            <h4 className="mb-2 font-black uppercase text-primary-foreground">3. Mint Generation</h4>
            <p className="text-xs font-bold text-primary-foreground/80">Tokenized equity minted back to user wallet.</p>
            {step >= 2 && (
              <div className="absolute -bottom-4 -right-4 animate-bounce-in border-4 border-foreground bg-background px-3 py-2 text-sm font-black text-foreground shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)]">
                +10 tsAAPL
              </div>
            )}
          </div>

        </div>

        {/* Floating Brutalist Accents */}
        <div className="absolute -right-6 top-10 hidden h-10 w-10 animate-float border-4 border-foreground bg-primary md:block" style={{ animationDelay: "1s" }}></div>
        <div className="absolute -left-8 bottom-10 hidden h-8 w-8 animate-float border-4 border-foreground bg-foreground md:block" style={{ animationDelay: "2s" }}></div>
      </div>
    </div>
  )
}

function MarqueeBanner() {
  const items = [
    "SECURED BY PYTH",
    "REAL-WORLD ASSETS",
    "PERMISSIONLESS",
    "NO INTERMEDIARIES",
    "INSTITUTIONAL BACKING",
    "1:1 BACKING",
  ]
  const repeated = Array.from({ length: 6 }, () => items).flat()

  return (
    <div className="flex w-full overflow-hidden border-y-4 border-foreground bg-primary py-3 select-none">
      <div className="flex w-max animate-marquee">
        <div className="flex shrink-0">
          {repeated.map((item, i) => (
            <span key={i} className="mx-6 flex items-center gap-6 text-sm font-black uppercase tracking-widest text-primary-foreground">
              {item}
              <div className="h-2 w-2 rounded-full border border-primary-foreground bg-primary-foreground"></div>
            </span>
          ))}
        </div>
        <div className="flex shrink-0">
          {repeated.map((item, i) => (
            <span key={i} className="mx-6 flex items-center gap-6 text-sm font-black uppercase tracking-widest text-primary-foreground">
              {item}
              <div className="h-2 w-2 rounded-full border border-primary-foreground bg-primary-foreground"></div>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { push } = useRouter()

  return (
    <main className="flex min-h-dvh flex-col overflow-x-hidden bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
        {/* Abstract Background Shapes */}
        <div className="absolute left-[10%] top-[20%] hidden h-24 w-24 animate-float border-4 border-foreground bg-card md:block" style={{ animationDelay: "0s" }}></div>
        <div className="absolute right-[15%] top-[15%] hidden h-16 w-16 animate-float border-4 border-foreground bg-primary md:block" style={{ animationDelay: "1.5s" }}></div>
        
        <div className="mx-auto max-w-5xl text-center z-10">
          <div className="mb-6 inline-block animate-slide-in-left border-4 border-foreground bg-primary px-4 py-2 shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)]">
            <span className="text-sm font-black tracking-widest text-primary-foreground uppercase">Next-Gen Synthetic Assets</span>
          </div>

          <h1 className="mb-6 animate-slide-in-left text-4xl leading-[1.1] font-black uppercase text-foreground sm:text-5xl md:text-7xl lg:text-[6rem]" style={{ animationDelay: "0.1s" }}>
            <span className="block break-words">Permissionless</span>
            <span className="inline-block mt-2 -rotate-1 border-4 border-foreground bg-card px-2 sm:px-4 py-2 shadow-[0.5rem_0.5rem_0rem_0rem_rgba(0,0,0,1)] transition-transform hover:rotate-0 dark:shadow-[0.5rem_0.5rem_0rem_0rem_rgba(255,255,255,1)]">
              Stock Issuance
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl animate-fade-in text-lg font-bold leading-relaxed text-muted-foreground md:text-xl" style={{ animationDelay: "0.2s" }}>
            Use stablecoins to back volatile stocks. Issue tokenized equities on-chain without gatekeepers, fully backed by real-world assets.
          </p>

          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-16 border-4 border-foreground bg-primary px-8 text-lg font-black uppercase text-primary-foreground shadow-[0.35rem_0.35rem_0rem_0rem_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[0.35rem_0.35rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none"
            >
              Start Issuing <ArrowRight className="ml-2 h-6 w-6" weight="bold" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 border-4 border-foreground bg-background px-8 text-lg font-black uppercase text-foreground shadow-[0.35rem_0.35rem_0rem_0rem_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[0.35rem_0.35rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none"
            >
              Read Whitepaper
            </Button>
          </div>
        </div>
      </section>

      <MarqueeBanner />

      {/* Institutional Core / Asset Engine */}
      <section className="bg-muted py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl">Institutional Backup.<br/>On-Chain Delivery.</h2>
            <p className="mt-4 text-lg font-bold text-muted-foreground">Watch how your crypto collateral converts to real-world backed equities.</p>
          </div>
          
          <AssetEngineAnimation />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase tracking-tight md:text-5xl">Three Steps. Zero Friction.</h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Deposit Stables",
                desc: "Lock USDC as collateral in our audited smart contracts.",
                bg: "bg-background"
              },
              {
                icon: Lightning,
                title: "Mint Stocks",
                desc: "Issue tokenized equity instantly, backed 1:1 by institutional partners.",
                bg: "bg-primary"
              },
              {
                icon: TrendUp,
                title: "Trade & Manage",
                desc: "Trade permissionlessly on our AMM or redeem for collateral anytime.",
                bg: "bg-background"
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className={`group relative border-4 border-foreground p-8 shadow-[0.35rem_0.35rem_0rem_0rem_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 hover:rotate-1 hover:shadow-[0.6rem_0.6rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.35rem_0.35rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-[0.6rem_0.6rem_0rem_0rem_rgba(255,255,255,1)] ${feature.bg}`}
              >
                {/* Watermark Number */}
                <div className="absolute right-4 top-4 text-6xl font-black text-foreground/5 opacity-50 transition-opacity group-hover:opacity-100">
                  0{i + 1}
                </div>
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center border-4 border-foreground bg-foreground">
                    <feature.icon className="h-8 w-8 text-background" weight="bold" />
                  </div>
                  <h3 className={`mb-3 text-2xl font-black uppercase ${feature.bg === 'bg-primary' ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {feature.title}
                  </h3>
                  <p className={`font-medium ${feature.bg === 'bg-primary' ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-foreground bg-foreground pt-12 pb-8 text-background">
        <div className="container mx-auto px-4 text-center sm:text-left">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 border-4 border-background bg-primary" />
              <span className="text-xl font-black tracking-widest uppercase">BIEQUITY</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="transition-transform hover:-translate-y-1 hover:text-primary">
                <TwitterLogo className="h-8 w-8" weight="fill" />
              </a>
              <a href="#" className="transition-transform hover:-translate-y-1 hover:text-primary">
                <GithubLogo className="h-8 w-8" weight="fill" />
              </a>
              <a href="#" className="text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary">
                Docs
              </a>
            </div>
          </div>
          <div className="mt-8 border-t-2 border-background/20 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs font-bold uppercase text-background/60">Built for the future. Open source.</p>
            <p className="text-xs font-bold uppercase text-background/60">&copy; {new Date().getFullYear()} Biequity</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
