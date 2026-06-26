'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Pedidos', href: '/pedidos' },
  { label: 'Remitos', href: '/remitos' },
  { label: 'Recepciones', href: '/recepciones' },
  { label: 'Stock', href: '/stock' },
  { label: 'Faltantes', href: '/faltantes' },
  { label: 'Maestros', href: '/maestros' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 flex items-center">
        <span className="mr-8 py-4 font-bold text-foreground text-sm tracking-tight">
          CODEEX Depósito
        </span>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-3 py-4 text-sm font-medium border-b-2 border-transparent transition-colors',
              pathname.startsWith(item.href)
                ? 'border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:border-border',
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
