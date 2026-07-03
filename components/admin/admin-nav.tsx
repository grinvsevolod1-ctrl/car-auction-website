'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, Users, PlusCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/admin', label: 'Обзор', icon: LayoutDashboard, exact: true },
  { href: '/admin/lots', label: 'Лоты', icon: Car },
  { href: '/admin/lots/new', label: 'Добавить лот', icon: PlusCircle },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
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
            {item.label}
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
