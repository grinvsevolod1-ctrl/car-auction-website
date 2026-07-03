import { getAdminUsers } from '@/lib/admin-queries'
import { getSession } from '@/lib/auth/session'
import { setUserRoleAction } from '@/lib/actions/lots'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Пользователи — Админка' }

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([getAdminUsers(), getSession()])

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
        Пользователи
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Всего пользователей: {users.length}
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Пользователь</th>
                <th className="px-4 py-3 font-medium">Ставки</th>
                <th className="px-4 py-3 font-medium">Выиграно</th>
                <th className="px-4 py-3 font-medium">Регистрация</th>
                <th className="px-4 py-3 font-medium">Роль</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isSelf = u.id === session?.userId
                return (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u._count.bids}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u._count.wonLots}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="inline-flex rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                          Вы · Админ
                        </span>
                      ) : (
                        <form action={setUserRoleAction} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={u.id} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary"
                          >
                            <option value="USER">Пользователь</option>
                            <option value="ADMIN">Администратор</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                          >
                            Сохранить
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
