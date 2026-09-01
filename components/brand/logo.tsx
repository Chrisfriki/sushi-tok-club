import { cn } from '@/lib/utils'

/** Sushi Tok wordmark with a small nigiri glyph. */
export function Logo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-coral text-coral-foreground shadow-sm">
        <NigiriGlyph className="size-5" />
      </span>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight">
          Sushi Tok
        </span>
      )}
    </span>
  )
}

export function NigiriGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* rice base */}
      <rect
        x="3"
        y="12.5"
        width="18"
        height="7"
        rx="3.5"
        fill="currentColor"
        opacity="0.35"
      />
      {/* fish topping */}
      <path
        d="M4 11.5c3-3.2 13-3.2 16 0 .5.55.2 1.5-.6 1.5H4.6c-.8 0-1.1-.95-.6-1.5Z"
        fill="currentColor"
      />
      {/* seaweed band */}
      <rect x="10.5" y="11.5" width="3" height="8.5" rx="1" fill="currentColor" />
    </svg>
  )
}
