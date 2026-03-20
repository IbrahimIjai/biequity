"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { ThemeToggle } from "./ThemeToggle"
import { List, X } from "@phosphor-icons/react"
import { useState } from "react"

export function Navbar() {
  const { push } = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 relative">
        
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center border-4 border-foreground bg-primary shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] transition-all group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)] dark:group-hover:shadow-none">
            
            <div className="h-3 w-3 border-2 border-foreground bg-background"></div>
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">BIEQUITY</span>
        </Link>

        
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/protocol"
            className="text-sm font-bold tracking-widest uppercase transition-colors hover:text-primary hover:underline hover:decoration-4 hover:underline-offset-4"
          >
            Protocol
          </Link>
          <Link 
            href="/docs" 
            className="text-sm font-bold tracking-widest uppercase transition-colors hover:text-primary hover:underline hover:decoration-4 hover:underline-offset-4"
          >
            Docs
          </Link>
        </nav>

        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            onClick={() => push("/trade")}
            className="hidden sm:inline-flex h-12 border-4 border-foreground bg-primary px-6 text-sm font-bold uppercase text-primary-foreground shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none"
          >
            Launch App
          </Button>

          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden h-10 w-10 border-4 border-foreground bg-background text-foreground shadow-[0.15rem_0.15rem_0rem_0rem_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[0.15rem_0.15rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" weight="bold" />
            ) : (
              <List className="h-5 w-5" weight="bold" />
            )}
            <span className="sr-only">Toggle mobile menu</span>
          </Button>
        </div>
      </div>

      
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b-4 border-foreground bg-background p-6 shadow-[0.5rem_0.5rem_0rem_0rem_rgba(0,0,0,1)] md:hidden dark:shadow-[0.5rem_0.5rem_0rem_0rem_rgba(255,255,255,1)] z-50">
          <nav className="flex flex-col gap-6">
            <Link
              href="/protocol"
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-4 border-foreground bg-card p-4 text-center text-lg font-black tracking-widest uppercase transition-transform hover:-translate-y-1 hover:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] dark:hover:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)]"
            >
              Protocol
            </Link>
            <Link
              href="/docs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-4 border-foreground bg-card p-4 text-center text-lg font-black tracking-widest uppercase transition-transform hover:-translate-y-1 hover:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] dark:hover:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)]"
            >
              Docs
            </Link>
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false)
                push("/trade")
              }}
              className="h-14 border-4 border-foreground bg-primary text-xl font-black tracking-widest uppercase text-primary-foreground shadow-[0.35rem_0.35rem_0rem_0rem_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:shadow-[0.35rem_0.35rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-none"
            >
              Launch App
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

