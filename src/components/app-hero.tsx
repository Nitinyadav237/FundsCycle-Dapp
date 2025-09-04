"use client"

import Image from "next/image"
import { AppForm } from "@/components/app-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import { WalletButton } from '@/components/solana/solana-provider'
import { useWalletUi } from '@wallet-ui/react'

function StatCard({
  value,
  label,
  gradient,
}: {
  value: string
  label: string
  gradient: string
}) {
  return (
    <Card className="flex-1 text-center p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group">
      <div className="relative">
        <p
          className={`text-3xl md:text-4xl font-bold bg-clip-text text-transparent ${gradient} group-hover:scale-110 transition-transform duration-300`}
        >
          {value}
        </p>
        <p className="text-muted-foreground text-sm font-medium mt-2 group-hover:text-foreground transition-colors duration-300">
          {label}
        </p>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Card>
  )
}

export default function AppHero() {

  const { account } = useWalletUi()
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />

      {/* Animated background shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-spin duration-[20s]" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)]" />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6 relative z-10">
        {/* LEFT SIDE */}
        <div className="space-y-8 animate-in slide-in-from-left duration-1000">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Live on Solana Devnet
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              FundCycle
              <span className="block text-4xl md:text-6xl mt-2">
                Protocol
              </span>
            </h1>

            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Decentralized group savings on Solana. Join rotating credit
            associations with{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              smart contract security
            </span>{" "}
            and community-driven financial growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 pt-4">

            <ErrorBoundary errorComponent={() => null}>
              {account ? (
                <AppForm
                  title="Create New Cycle"
                  triggerText="🚀 Start New Cycle"
                  triggerVariant="default"
                  triggerClassName="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group font-semibold text-lg"
                />
              ) : (
                <WalletButton size="md" />
              )}
            </ErrorBoundary>

            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group"
            >
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                Learn How It Works
              </span>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-8 pt-6 opacity-70">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Audited Smart Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">Community Governed</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative animate-in slide-in-from-right duration-1000 delay-300">
          <div className="relative z-10">
            <Image
              src="/hero-img.jpg"
              alt="FundCycle Illustration"
              width={700}
              height={550}
              className="rounded-2xl shadow-2xl object-cover hover:scale-105 transition-transform duration-700 border border-white/20"
              priority
            />

            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg animate-bounce delay-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SOL</span>
            </div>

            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl shadow-lg animate-bounce delay-700 flex items-center justify-center">
              <span className="text-white font-bold">🔒</span>
            </div>
          </div>

          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-2xl transform scale-110 -z-10" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 relative z-10 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom duration-1000 delay-500">
          <StatCard
            value="1,000+"
            label="Active Members"
            gradient="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
          />
          <StatCard
            value="50k+"
            label="SOL Circulated"
            gradient="bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400"
          />
          <StatCard
            value="100%"
            label="Secure"
            gradient="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400"
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-gray-950 pointer-events-none" />
    </section>
  )
}