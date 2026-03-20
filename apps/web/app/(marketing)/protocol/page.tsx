import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { pageSEO } from "@/lib/seo"
import Link from "next/link"

export const metadata = pageSEO.protocol()

export default function ProtocolPage() {
  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b-4 border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center">
              ←
            </span>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 border-4 border-border bg-primary" />
              <span className="text-xl font-bold tracking-tight">BIEQUITY</span>
            </div>
          </Link>
          <div className="text-sm font-bold">PROTOCOL DASHBOARD</div>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-6xl">
          {/* Top Metrics */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-4">
              <CardContent className="p-6">
                <div className="mb-2 text-sm text-muted-foreground">
                  TREASURY FUNDS
                </div>
                <div className="mb-1 text-3xl font-bold text-primary">
                  $2,450,000
                </div>
                <div className="text-xs text-muted-foreground">USDC</div>
              </CardContent>
            </Card>

            <Card className="border-4">
              <CardContent className="p-6">
                <div className="mb-2 text-sm text-muted-foreground">
                  TVL BACKED
                </div>
                <div className="mb-1 text-3xl font-bold text-primary">
                  $1,890,000
                </div>
                <div className="text-xs text-muted-foreground">
                  77.1% of Treasury
                </div>
              </CardContent>
            </Card>

            <Card className="border-4">
              <CardContent className="p-6">
                <div className="mb-2 text-sm text-muted-foreground">
                  BACKING PROCESSING
                </div>
                <div className="mb-1 text-3xl font-bold text-primary">
                  $560,000
                </div>
                <div className="text-xs text-muted-foreground">
                  22.9% Pending
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stocks Section */}
          <div className="mb-4">
            <h2 className="mb-4 text-2xl font-bold">ISSUED STOCKS</h2>
          </div>

          {/* Stock Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* TSLA Card */}
            <Card className="border-4">
              <CardHeader className="border-b-4 border-border bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">TSLA</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      Tesla, Inc.
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <span className="inline-flex h-5 w-5 items-center justify-center">
                      ↗
                    </span>
                    <span className="text-sm font-bold">+2.4%</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">
                      TOTAL MINTED
                    </div>
                    <div className="text-lg font-bold">12,500</div>
                    <div className="text-xs text-muted-foreground">tokens</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">
                      TOTAL BACKED
                    </div>
                    <div className="text-lg font-bold text-primary">10,200</div>
                    <div className="text-xs text-muted-foreground">81.6%</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">
                      PROCESSING
                    </div>
                    <div className="text-lg font-bold text-primary">2,300</div>
                    <div className="text-xs text-muted-foreground">18.4%</div>
                  </div>
                </div>

                <div className="border-t-2 border-border pt-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Collateral Value
                    </span>
                    <span className="font-bold">$1,020,000 USDC</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Collateral Ratio
                    </span>
                    <span className="font-bold">150%</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="h-8 w-full border border-transparent bg-primary px-2.5 text-xs font-medium text-primary-foreground shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  View Details
                </button>
              </CardContent>
            </Card>

            {/* AAPL Card */}
            <Card className="border-4">
              <CardHeader className="border-b-4 border-border bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">AAPL</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      Apple Inc.
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-destructive">
                    <span className="inline-flex h-5 w-5 items-center justify-center">
                      ↘
                    </span>
                    <span className="text-sm font-bold">-0.8%</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">
                      TOTAL MINTED
                    </div>
                    <div className="text-lg font-bold">8,750</div>
                    <div className="text-xs text-muted-foreground">tokens</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">
                      TOTAL BACKED
                    </div>
                    <div className="text-lg font-bold text-primary">6,900</div>
                    <div className="text-xs text-muted-foreground">78.9%</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-muted-foreground">
                      PROCESSING
                    </div>
                    <div className="text-lg font-bold text-primary">1,850</div>
                    <div className="text-xs text-muted-foreground">21.1%</div>
                  </div>
                </div>

                <div className="border-t-2 border-border pt-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Collateral Value
                    </span>
                    <span className="font-bold">$870,000 USDC</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Collateral Ratio
                    </span>
                    <span className="font-bold">145%</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="h-8 w-full border border-transparent bg-primary px-2.5 text-xs font-medium text-primary-foreground shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  View Details
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t-4 border-border py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs">
            <div className="text-muted-foreground">
              Last Updated: 2 minutes ago
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground">Base Network</span>
              <span className="font-bold text-primary">● Live</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
