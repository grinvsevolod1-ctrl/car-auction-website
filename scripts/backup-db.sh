#!/usr/bin/env bash
# Резервное копирование БД IGNIS (PostgreSQL) с ротацией.
#
# Использование на VPS (ежедневно в 3:00):
#   0 3 * * * /path/to/app/scripts/backup-db.sh >> /var/log/ignis-backup.log 2>&1
#
# Требует переменную DATABASE_URL (или задайте её ниже) и установленный pg_dump.
set -euo pipefail

# Каталог для дампов (можно переопределить: BACKUP_DIR=/mnt/backups ./backup-db.sh)
BACKUP_DIR="${BACKUP_DIR:-/var/backups/ignis}"
# Сколько дней хранить бэкапы.
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# Пытаемся подтянуть DATABASE_URL из .env, если не задан в окружении.
if [ -z "${DATABASE_URL:-}" ] && [ -f ".env" ]; then
  # shellcheck disable=SC1091
  DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | head -n1 | cut -d '=' -f2- | tr -d '"'"'"'')"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ОШИБКА: DATABASE_URL не задан." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTFILE="$BACKUP_DIR/ignis-$TIMESTAMP.sql.gz"

echo "[$(date -Is)] Создаю бэкап -> $OUTFILE"
# --no-owner/--no-acl делают дамп переносимым между инстансами.
pg_dump --no-owner --no-acl "$DATABASE_URL" | gzip -9 > "$OUTFILE"

# Проверяем, что файл не пустой.
if [ ! -s "$OUTFILE" ]; then
  echo "ОШИБКА: бэкап пуст, удаляю." >&2
  rm -f "$OUTFILE"
  exit 1
fi

echo "[$(date -Is)] Готово: $(du -h "$OUTFILE" | cut -f1)"

# Ротация: удаляем дампы старше RETENTION_DAYS.
find "$BACKUP_DIR" -name 'ignis-*.sql.gz' -type f -mtime "+$RETENTION_DAYS" -delete
echo "[$(date -Is)] Ротация завершена (хранение: ${RETENTION_DAYS} дн.)"

# Восстановление из бэкапа:
#   gunzip -c ignis-YYYYMMDD-HHMMSS.sql.gz | psql "$DATABASE_URL"
