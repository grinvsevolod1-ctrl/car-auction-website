// Простой структурированный логгер. В проде пишет JSON-строки в stdout,
// которые удобно собирать через pm2/systemd/Docker. В dev — читаемый вывод.
// При необходимости сюда легко подключить Sentry в функции capture().

type Level = 'debug' | 'info' | 'warn' | 'error'

const isProd = process.env.NODE_ENV === 'production'

function write(level: Level, message: string, meta?: Record<string, unknown>) {
  const time = new Date().toISOString()

  if (isProd) {
    // Структурированный JSON для агрегаторов логов.
    const line = JSON.stringify({ time, level, message, ...meta })
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
    return
  }

  const prefix = `[${level.toUpperCase()}] ${message}`
  const args = meta ? [prefix, meta] : [prefix]
  if (level === 'error') console.error(...args)
  else if (level === 'warn') console.warn(...args)
  else console.log(...args)
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) =>
    write('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) =>
    write('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    write('warn', msg, meta),
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) => {
    const errMeta =
      err instanceof Error
        ? { error: err.message, stack: err.stack }
        : err !== undefined
          ? { error: String(err) }
          : {}
    write('error', msg, { ...errMeta, ...meta })
  },
}
