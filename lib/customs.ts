import 'server-only'
import { getAllSettings } from './settings'
import type { Currency } from './money'

export type CustomsInput = {
  carValue: number // цена авто в валюте лота
  currency: Currency
  region?: string | null // Америка | Европа | Азия
}

export type CustomsLine = { label: string; amount: number }

export type CustomsResult = {
  currency: Currency
  carValue: number
  lines: CustomsLine[] // разбивка сборов (уже со скидкой, если крипта)
  feesTotal: number // сумма всех сборов
  grandTotal: number // авто + сборы
  cryptoDiscountPct: number // применённая скидка (0, если не крипта)
  feesTotalNoDiscount: number // сборы без скидки (для наглядного сравнения)
}

// Рассчитывает растаможку, доставку и сборы площадки для лота.
// При оплате криптой (currency = USD) процессуальные платежи и растаможка
// уменьшаются на crypto_discount_pct.
export async function calcCustoms(input: CustomsInput): Promise<CustomsResult> {
  const s = await getAllSettings()
  const dutyPct = Number(s.customs_duty_pct)
  const vatPct = Number(s.customs_vat_pct)
  const utilFeeByn = Number(s.customs_util_fee)
  const servicePct = Number(s.service_fee_pct)
  const shipUsByn = Number(s.shipping_us)
  const shipEuByn = Number(s.shipping_eu)
  const usdToByn = Number(s.usd_to_byn) || 1
  const discountPct = Number(s.crypto_discount_pct)

  const isCrypto = input.currency === 'USD'
  // Конверсия фиксированных BYN-сумм в валюту лота.
  const toCur = (byn: number) => (isCrypto ? byn / usdToByn : byn)

  const region = (input.region ?? '').toLowerCase()
  const shippingByn = region.includes('амер')
    ? shipUsByn
    : region.includes('евр')
      ? shipEuByn
      : Math.round((shipUsByn + shipEuByn) / 2)

  const duty = (input.carValue * dutyPct) / 100
  const vat = ((input.carValue + duty) * vatPct) / 100
  const util = toCur(utilFeeByn)
  const service = (input.carValue * servicePct) / 100
  const shipping = toCur(shippingByn)

  const rawLines: CustomsLine[] = [
    { label: 'Таможенная пошлина', amount: duty },
    { label: 'НДС при ввозе', amount: vat },
    { label: 'Утилизационный сбор', amount: util },
    { label: 'Доставка', amount: shipping },
    { label: 'Сервисный сбор площадки', amount: service },
  ]

  const feesTotalNoDiscount = Math.round(
    rawLines.reduce((sum, l) => sum + l.amount, 0),
  )

  const factor = isCrypto ? 1 - discountPct / 100 : 1
  const lines = rawLines.map((l) => ({
    label: l.label,
    amount: Math.round(l.amount * factor),
  }))
  const feesTotal = lines.reduce((sum, l) => sum + l.amount, 0)

  return {
    currency: input.currency,
    carValue: input.carValue,
    lines,
    feesTotal,
    grandTotal: input.carValue + feesTotal,
    cryptoDiscountPct: isCrypto ? discountPct : 0,
    feesTotalNoDiscount,
  }
}
