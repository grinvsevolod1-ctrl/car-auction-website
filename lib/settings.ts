import 'server-only'
import { prisma } from './prisma'

// Настройки портала (таблица SiteSetting, ключ-значение) с типобезопасными
// значениями по умолчанию. Всё редактируется через админку.

export const SETTING_DEFAULTS = {
  // Скидка на процессуальные платежи и растаможку при оплате криптой, %.
  crypto_discount_pct: '70',
  // Курс USD/USDT -> BYN (сколько Br за 1 USDT). Нужен для калькулятора.
  usd_to_byn: '3.25',
  // Ставка таможенной пошлины от стоимости авто, %.
  customs_duty_pct: '20',
  // Утилизационный сбор, фиксированный, Br.
  customs_util_fee: '544',
  // Ставка НДС на ввоз, %.
  customs_vat_pct: '20',
  // Сервисный сбор площадки (комиссия) от суммы сделки, %.
  service_fee_pct: '5',
  // Стоимость доставки по умолчанию из США, Br.
  shipping_us: '6500',
  // Стоимость доставки по умолчанию из Европы, Br.
  shipping_eu: '3500',
  // Реквизиты / инструкция ЕРИП (показывается пользователю).
  erip_instructions:
    'Оплатите по ссылке ЕРИП и укажите код заявки в комментарии к платежу. Зачисление после проверки оператором.',
  // Инструкция по оплате криптой.
  crypto_instructions:
    'Переведите точную сумму на указанный адрес. После перевода вставьте хэш транзакции. Зачисление после подтверждения сети и проверки оператором.',
  // Контакт оператора (Telegram) для вопросов по оплате.
  operator_telegram: '@ignis_support',
} as const

export type SettingKey = keyof typeof SETTING_DEFAULTS

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.siteSetting.findUnique({ where: { key } })
  return row?.value ?? SETTING_DEFAULTS[key]
}

export async function getSettingNumber(key: SettingKey): Promise<number> {
  const v = await getSetting(key)
  const n = Number(v)
  return Number.isFinite(n) ? n : Number(SETTING_DEFAULTS[key])
}

// Возвращает все настройки (дефолты, перекрытые сохранёнными значениями).
export async function getAllSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.siteSetting.findMany()
  const map = new Map(rows.map((r) => [r.key, r.value]))
  const result = {} as Record<SettingKey, string>
  for (const key of Object.keys(SETTING_DEFAULTS) as SettingKey[]) {
    result[key] = map.get(key) ?? SETTING_DEFAULTS[key]
  }
  return result
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}
