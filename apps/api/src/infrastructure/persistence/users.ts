export type UserRole = 'admin' | 'member'
export type AccountStatus = 'active' | 'suspended'

export type UserRecord = {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  status: AccountStatus
}

const seed = (): UserRecord[] => [
  {
    id: 'user_admin',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin12345',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'user_member',
    name: 'Member User',
    email: 'member@example.com',
    password: 'member12345',
    role: 'member',
    status: 'active',
  },
  ...Array.from({ length: 10 }, (_, index) => {
    const n = index + 1
    return {
      id: `user_${n}`,
      name: `User ${n}`,
      email: `user${n}@example.com`,
      password: 'unused-password',
      role: n % 2 === 0 ? 'member' : 'admin',
      status: n % 3 === 0 ? 'suspended' : 'active',
    } satisfies UserRecord
  }),
]

let users = seed()

export function resetUsers() {
  users = seed()
}

export function listUserRecords() {
  return users.map((user) => ({ ...user }))
}

export function findUserByEmail(email: string) {
  return users.find((user) => user.email === email.toLowerCase()) ?? null
}

export function findUserById(id: string) {
  return users.find((user) => user.id === id) ?? null
}

export function updateUserRecord(
  id: string,
  input: Partial<Pick<UserRecord, 'name' | 'email' | 'role' | 'status'>>,
) {
  const user = users.find((item) => item.id === id)
  if (!user) return null
  if (input.email && input.email !== user.email) {
    const taken = users.some((item) => item.email === input.email && item.id !== id)
    if (taken) return 'email-taken' as const
  }
  Object.assign(user, input)
  return { ...user }
}
