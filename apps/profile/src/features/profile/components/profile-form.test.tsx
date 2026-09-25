import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProfileForm } from './profile-form'

describe('ProfileForm', () => {
  it('blocks save when the display name is cleared', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <ProfileForm
        defaultValues={{ displayName: 'Member User', email: 'member@example.com' }}
        onSubmit={onSubmit}
      />,
    )

    await user.clear(screen.getByLabelText('Display name'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Display name is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
