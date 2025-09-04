"use client"

import {
  Key,
  DollarSign,
  Calendar,
  RefreshCcw,
  PiggyBank,
  Scale,
  Percent,
  Shield,
} from "lucide-react"

import { AppForm } from "@/components/app-form"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "next/dist/client/components/error-boundary"
import { WalletButton } from '@/components/solana/solana-provider'
import { useWalletUi } from '@wallet-ui/react'


const features = [
  {
    icon: Key,
    title: "Admin Initialization",
    description:
      "Set up cycles with customizable terms, collateral requirements, and participant limits.",
    color: "text-blue-500 dark:text-blue-400",
  },
  {
    icon: DollarSign,
    title: "Collateral Deposits",
    description:
      "Upfront commitment ensures member accountability and fund security.",
    color: "text-emerald-500 dark:text-emerald-400",
  },
  {
    icon: Calendar,
    title: "Monthly Contributions",
    description:
      "Scheduled payments keep members active and cycles running smoothly.",
    color: "text-purple-500 dark:text-purple-400",
  },
  {
    icon: RefreshCcw,
    title: "Round Robin Payouts",
    description:
      "Members take turns receiving the collective monthly fund in rotation.",
    color: "text-orange-500 dark:text-orange-400",
  },
  {
    icon: PiggyBank,
    title: "Reserve Fund",
    description:
      "Risk buffer and yield generation for enhanced security and returns.",
    color: "text-pink-500 dark:text-pink-400",
  },
  {
    icon: Scale,
    title: "Penalties & Rules",
    description:
      "Late or missed payments result in collateral forfeiture and removal.",
    color: "text-red-500 dark:text-red-400",
  },
  {
    icon: Shield,
    title: "Smart Contract Security",
    description:
      "Powered by Solana blockchain for transparent and trustless operations.",
    color: "text-green-500 dark:text-green-400",
  },
  {
    icon: Percent,
    title: "Platform Fees",
    description:
      "Minimal 1.5% fee ensures sustainable protocol development and maintenance.",
    color: "text-indigo-500 dark:text-indigo-400",
  },
]

// Feature Card
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: (typeof features)[0]) {

  return (
    <Card className="p-6 group cursor-pointer transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/70 dark:hover:border-gray-600/70 shadow-lg hover:shadow-xl rounded-xl hover:scale-105">
      <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-200/30 dark:border-gray-600/30 group-hover:scale-110 transition-transform duration-300">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <CardTitle className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </CardTitle>
      <CardDescription className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {description}
      </CardDescription>
    </Card>
  )
}

// Bottom CTA
function CallToAction() {
  const { account } = useWalletUi()

  return (
    <div className="text-center mt-16">
      <div className="max-w-2xl mx-auto p-8 rounded-2xl shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Ready to revolutionize your savings?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Join thousands of users already building wealth through decentralized
          group savings.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">

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
      </div>
    </div>
  )
}

export default function AppFeature() {

  return (
    <>
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <header className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Protocol Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the power of decentralized group savings with smart
              contract automation and community-driven financial growth.
            </p>
          </header>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>

          {/* Bottom CTA */}
          <CallToAction />
        </div>
      </section>
    </>
  )
}