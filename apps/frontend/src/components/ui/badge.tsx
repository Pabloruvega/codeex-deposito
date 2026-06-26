import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'inactive' | 'info'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-primary text-primary-foreground',
        variant === 'success' && 'bg-foreground text-background',
        variant === 'warning' && 'border border-border text-foreground',
        variant === 'inactive' && 'bg-muted text-muted-foreground',
        variant === 'info' && 'bg-secondary text-secondary-foreground',
        className,
      )}
      {...props}
    />
  )
}
