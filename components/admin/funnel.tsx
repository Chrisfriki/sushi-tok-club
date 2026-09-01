import type { FunnelStep } from "@/lib/analytics"
import { percent } from "@/lib/format"

export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].value : null
        const conv = prev && prev > 0 ? step.value / prev : null
        const width = Math.max((step.value / max) * 100, 3)
        return (
          <div key={step.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">{step.label}</span>
              <span className="tabular-nums">
                {step.value.toLocaleString("es-ES")}
                {conv !== null ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {percent(conv)}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-coral transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
