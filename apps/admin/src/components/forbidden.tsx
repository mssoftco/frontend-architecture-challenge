const profileUrl = process.env.NEXT_PUBLIC_PROFILE_URL ?? 'http://localhost:3001'

export function Forbidden() {
  return (
    <main className="mx-auto max-w-lg p-10">
      <h1 className="text-xl font-semibold">Access denied</h1>
      <p className="mt-2 text-sm text-zinc-600">This area is only available to admins.</p>
      <a className="mt-4 inline-block text-sm underline" href={`${profileUrl}/profile`}>
        Go to your profile
      </a>
    </main>
  )
}
