import { UserEditScreen } from '@/features/user-administration'

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UserEditScreen id={id} />
}
