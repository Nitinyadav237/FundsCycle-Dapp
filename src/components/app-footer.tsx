"use client"

import { Coins, Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppFooter() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center py-8 gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl text-white">
              <Coins className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              FundCycle
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-6 flex-wrap justify-center">
            <Button variant="link" asChild>
              <a href="#">Documentation</a>
            </Button>
            <Button variant="link" asChild>
              <a href="#">Community</a>
            </Button>
            <Button variant="link" asChild>
              <a href="#">Support</a>
            </Button>
            <Button variant="link" asChild>
              <a href="#">Blog</a>
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            <Button variant="outline" size="icon" asChild>
              <a href="#">
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="#">
                <Twitter className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="#">
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} FundCycle. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Button variant="link" asChild>
              <a href="#">Privacy Policy</a>
            </Button>
            <Button variant="link" asChild>
              <a href="#">Terms of Service</a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
