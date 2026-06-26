import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'default', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/85',
        variant === 'outline' && 'border border-border bg-card text-foreground hover:bg-secondary',
        variant === 'ghost' && 'text-foreground hover:bg-accent hover:text-foreground',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        size === 'sm' && 'h-8 px-3 text-xs gap-1',
        size === 'md' && 'h-10 px-4 text-sm gap-1.5',
        size === 'lg' && 'h-12 px-6 text-base gap-2',
        className,
      )}
      {...props}
    />
  )
}
