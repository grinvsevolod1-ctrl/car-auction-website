import { Calculator, BadgePercent } from 'lucide-react'
import type { CustomsResult } from '@/lib/customs'
import { formatMoney } from '@/lib/money'

// Презентационный блок расчёта растаможки/сборов для страницы лота.
export function CustomsEstimate({
  result,
  basedOnCurrent,
}: {
  result: CustomsResult
  basedOnCurrent?: boolean
}) {
  const { currency, carValue, lines, feesTotal, grandTotal, cryptoDiscountPct } =
    result
  const saved =
    cryptoDiscountPct > 0 ? result.feesTotalNoDiscount - feesTotal : 0

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
        <Calculator className="size-4 text-primary" />
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">
          Расчёт «под ключ»
        </h2>
      </div>

      <div className="px-4 py-4">
        <p className="text-xs text-muted-foreground">
          {basedOnCurrent
            ? 'Ориентировочный расчёт от текущей цены лота. Итог зависит от финальной ставки.'
            : 'Ориентировочный расчёт стоимости с учётом доставки, растаможки и сборов площадки.'}
        </p>

        {cryptoDiscountPct > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            <BadgePercent className="size-4 shrink-0" />
            <span>
              Оплата криптой: −{cryptoDiscountPct}% на сборы и растаможку
              {saved > 0 && (
                <> — экономия {formatMoney(saved, currency)}</>
              )}
            </span>
          </div>
        )}

        <dl className="mt-3 divide-y divide-border/70 text-sm">
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-muted-foreground">Стоимость автомобиля</dt>
            <dd className="font-medium tabular-nums">
              {formatMoney(carValue, currency)}
            </dd>
          </div>
          {lines.map((l) => (
            <div key={l.label} className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">{l.label}</dt>
              <dd className="font-medium tabular-nums">
                {formatMoney(l.amount, currency)}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-muted-foreground">Сумма сборов</dt>
            <dd className="font-medium tabular-nums">
              {formatMoney(feesTotal, currency)}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
          <span className="font-display text-sm font-bold uppercase tracking-wide">
            Итого под ключ
          </span>
          <span className="font-display text-xl font-extrabold tabular-nums text-primary">
            {formatMoney(grandTotal, currency)}
          </span>
        </div>
      </div>
    </div>
  )
}
