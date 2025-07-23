import  React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./global.css"
import { AppSidebar } from "../components/AppSideBar"
import { ReduxProvider } from "../app/Providers"; 
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SGT-400 Compressor Dashboard",
  description: "Industrial compressor monitoring and control system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <ReduxProvider>
          <div className="flex h-screen">
            <AppSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
              <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-semibold">
                    SGT-400 Compressor Control System
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">
                    {new Date().toLocaleString()}
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </header>
              <div className="flex-1 overflow-auto">{children}</div>
            </main>
          </div>
        </ReduxProvider>
      </body>
    </html>
  )
}
