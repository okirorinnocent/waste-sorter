import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sortwise | Smarter waste sorting",
  description: "Identify everyday waste and learn how to dispose of it correctly.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
