import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UsersPage from '../pages/users/UsersPage';

vi.mock('../services/user.service', () => {
  return {
    userService: {
      list: vi.fn(async () => ({
        data: [
          {
            id: 'u1',
            email: 'admin@creditjambo.com',
            firstName: 'System',
            lastName: 'Admin',
            phoneNumber: '+250788000000',
            role: 'admin',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            sessionsActive: 1,
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      })),
    },
  };
});

describe('UsersPage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders users list and shows a user card on mobile layout', async () => {
    render(
      <MemoryRouter initialEntries={["/users"]}>
        <UsersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const matches = screen.getAllByText(/System\s*Admin/i);
      expect(matches.length).toBeGreaterThan(0);
    });

    const emailEls = screen.getAllByText(/admin@creditjambo.com/i);
    expect(emailEls.length).toBeGreaterThan(0);
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    expect(viewButtons.length).toBeGreaterThan(0);
  });
});


