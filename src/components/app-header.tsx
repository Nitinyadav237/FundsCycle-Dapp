'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Menu, Coins, X } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { ClusterButton, WalletButton } from '@/components/solana/solana-provider'
import clsx from 'clsx'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

import { DashboardLink } from '@/components/app-dashboard-link'

type LinkItem = { label: string; path: string; isDashboard?: boolean }

function NavLink({ label, path, isDashboard, onClick, isMobile = false }: LinkItem & { onClick?: () => void; isMobile?: boolean }) {
  const pathname = usePathname()
  const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path)
  const isDashboardLink = isDashboard === true

  if (isMobile) {
    const commonClasses = clsx(
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden w-full text-left',
      isActive
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    )

    if (isDashboardLink) {
      return (
        <DashboardLink onClick={onClick} className={commonClasses}>
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
          )}
          <span className="font-medium">{label}</span>
          {isActive && <Badge variant="secondary" className="ml-auto">Active</Badge>}
        </DashboardLink>
      )
    }

    return (
      <Link
        href={path}
        onClick={onClick}
        className={commonClasses}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
        )}
        <span className="font-medium">{label}</span>
        {isActive && <Badge variant="secondary" className="ml-auto">Active</Badge>}
      </Link>
    )
  }

  const commonClasses = clsx(
    'relative px-4 py-2 rounded-lg transition-all duration-200 font-medium group',
    isActive
      ? 'text-primary bg-primary/5 border border-primary/20'
      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
  )

  if (isDashboardLink) {
    return (
      <DashboardLink onClick={onClick} className={commonClasses}>
        {label}
        {isActive && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
        )}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </DashboardLink>
    )
  }

  return (
    <Link
      href={path}
      onClick={onClick}
      className={commonClasses}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
      )}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </Link>
  )
}

export default function AppHeader({ links = [] }: { links: LinkItem[] }) {
  return (
    <header className="px-10 sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background" />

      <div className="container mx-auto relative z-10">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-3 group" href="/">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 
                                flex items-center justify-center shadow-lg 
                                group-hover:shadow-xl group-hover:shadow-primary/25 
                                group-hover:scale-110 transition-all duration-300
                                before:absolute before:inset-0 before:rounded-xl 
                                before:bg-gradient-to-br before:from-white/20 before:to-transparent
                                before:opacity-0 group-hover:before:opacity-100 before:transition-opacity">
                  <Coins className="w-6 h-6 text-white relative z-10" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 
                                 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 
                                 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  FundCycle
                </span>
                <span className="text-xs text-muted-foreground -mt-1">Protocol</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="gap-2">
                {links.map((link) => (
                  <NavigationMenuItem key={link.path}>
                    <NavLink {...link} />
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Devnet</span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <WalletButton size="sm" />
            <ClusterButton size="sm" />
            <ThemeSelect />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 hover:bg-accent/50 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-l border-border/50">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 
                                        flex items-center justify-center">
                          <Coins className="w-4 h-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 
                                         dark:from-blue-400 dark:to-purple-400 
                                         bg-clip-text text-transparent">
                          FundCycle
                        </span>
                      </SheetTitle>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">Live on Solana</span>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 p-6 space-y-6">
                    {/* Navigation Links */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Navigation</h3>
                      {links.map((link) => (
                        <NavLink key={link.path} {...link} isMobile onClick={() => { }} />
                      ))}
                    </div>

                    <Separator />

                    {/* Mobile Actions */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground">Settings</h3>
                      <div className="space-y-3">
                        <WalletButton />
                        <ClusterButton />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Theme</span>
                          <ThemeSelect />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 pt-0 border-t border-border/50">
                    <div className="text-xs text-muted-foreground text-center">
                      <p>© 2025 FundCycle Protocol</p>
                      <p className="mt-1">Decentralized group savings on Solana</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}