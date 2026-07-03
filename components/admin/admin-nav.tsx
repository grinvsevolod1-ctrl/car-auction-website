'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  Users,
  PlusCircle,
  ExternalLink,
  Wallet,
  ShieldCheck,
  CreditCard,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/admin', label: 'Обзор', icon: LayoutDashboard, exact: true },
  { href: '/admin/lots', label: 'Лоты', icon: Car },
  { href: '/admin/lots/new', label: 'Добавить лот', icon: PlusCircle },
  { href: '/admin/deposits', label: 'Пополнения', icon: Wallet, badgeKey: 'deposits' },
  { href: '/admin/kyc', label: 'Верификация', icon: ShieldCheck, badgeKey: 'kyc' },
  { href: '/admin/payments', label: 'Реквизиты', icon: CreditCard },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

export function AdminNav({
  badges = {},
}: {
  badges?: { deposits?: number; kyc?: number }
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const badge = item.badgeKey
          ? badges[item.badgeKey as 'deposits' | 'kyc']
          : undefined
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {badge ? (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-bold',
                  active
                    ? 'bg-primary-foreground text-primary'
                    : 'bg-highlight text-highlight-foreground',
                )}
              >
                {badge}
              </span>
            ) : null}
          </Link>
        )
      })}

      <Link
        href="/"
        className="mt-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="size-4" />
        На сайт
      </Link>
    </nav>
  )
}
