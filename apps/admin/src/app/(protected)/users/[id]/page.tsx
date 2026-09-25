import { UserDetailsScreen } from '@/features/user-administration'

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UserDetailsScreen id={id} />
}
