"use client"

import { setupGlobalErrorHandlers } from "@/lib/error-handling"
import type { AppProps } from "next/app"
import { useEffect } from "react"

export default function App({ Component, pageProps }: AppProps) {
  // Set up global error handlers when the app loads
  useEffect(() => {
    setupGlobalErrorHandlers()
  }, [])

  return <Component {...pageProps} />
}

