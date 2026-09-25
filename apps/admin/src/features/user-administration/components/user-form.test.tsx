import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UserForm } from './user-form'

const defaults = {
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin' as const,
  status: 'active' as const,
}

describe('UserForm', () => {
  it('blocks save when the name is cleared', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<UserForm defaultValues={defaults} onSubmit={onSubmit} />)

    await user.clear(screen.getByLabelText('Name'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
