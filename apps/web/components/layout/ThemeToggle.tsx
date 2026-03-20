"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 border-4 border-foreground bg-background shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)]"
      />
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-10 w-10 border-4 border-foreground bg-background text-foreground shadow-[0.25rem_0.25rem_0rem_0rem_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[0.35rem_0.35rem_0rem_0rem_rgba(0,0,0,1)] dark:shadow-[0.25rem_0.25rem_0rem_0rem_rgba(255,255,255,1)] dark:hover:shadow-[0.35rem_0.35rem_0rem_0rem_rgba(255,255,255,1)]"
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
