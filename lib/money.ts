// Денежные помощники: форматирование BYN и криптобаланса (USD/USDT),
// список поддерживаемых криптовалют.

export type Currency = 'BYN' | 'USD'

export function currencyLabel(c: Currency): string {
  return c === 'USD' ? 'USDT' : 'Br'
}

export function currencyName(c: Currency): string {
  return c === 'USD' ? 'Крипта (USDT)' : 'Белорусские рубли'
}

// Форматирует целую сумму в валюте баланса/лота.
export function formatMoney(value: number, currency: Currency): string {
  const n = new Intl.NumberFormat('ru-RU').format(value)
  return currency === 'USD' ? `${n} USDT` : `${n} Br`
}

// Популярные криптовалюты для пополнения. asset — тикер, networks — сети.
export const CRYPTO_ASSETS = [
  { asset: 'USDT', name: 'Tether', networks: ['TRC20', 'ERC20', 'BEP20'] },
  { asset: 'USDC', name: 'USD Coin', networks: ['ERC20', 'BEP20', 'TRC20'] },
  { asset: 'BTC', name: 'Bitcoin', networks: ['Bitcoin'] },
  { asset: 'ETH', name: 'Ethereum', networks: ['ERC20'] },
  { asset: 'BNB', name: 'BNB', networks: ['BEP20'] },
  { asset: 'TRX', name: 'TRON', networks: ['TRC20'] },
  { asset: 'TON', name: 'Toncoin', networks: ['TON'] },
  { asset: 'XMR', name: 'Monero', networks: ['Monero'] },
  { asset: 'LTC', name: 'Litecoin', networks: ['Litecoin'] },
  { asset: 'SOL', name: 'Solana', networks: ['Solana'] },
  { asset: 'DOGE', name: 'Dogecoin', networks: ['Dogecoin'] },
  { asset: 'XRP', name: 'XRP', networks: ['Ripple'] },
] as const

export type CryptoAssetTicker = (typeof CRYPTO_ASSETS)[number]['asset']

export function isCryptoAsset(ticker: string): boolean {
  return CRYPTO_ASSETS.some((c) => c.asset === ticker)
}
