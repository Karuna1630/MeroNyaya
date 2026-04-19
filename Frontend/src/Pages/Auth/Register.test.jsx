// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Register from './Register';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const mockDispatch = vi.fn();

vi.mock('../store/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

vi.mock('../slices/auth', () => ({
  registerUser: vi.fn(),
  clearError: vi.fn(() => ({ type: 'auth/clearError' })),
}));

vi.mock('../../components/Header', () => ({
  default: () => null,
}));

vi.mock('../../components/Footer', () => ({
  default: () => null,
}));

vi.mock('../../assets/register.jpg', () => ({
  default: 'register.jpg',
}));

beforeEach(() => {
  vi.clearAllMocks();

  useAppDispatch.mockReturnValue(mockDispatch);
  useAppSelector.mockImplementation((selector) =>
    selector({ auth: { registerLoading: false, registerError: null } })
  );
});

// Test to check if the Register component renders the form fields and continue button correctly
it('renders register form fields and continue button', async () => {
  const { container } = render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: /create account/i })).toBeInTheDocument();
  expect(screen.getByText(/full name/i)).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
  expect(screen.getByText(/phone/i)).toBeInTheDocument();

  expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
  expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
  expect(container.querySelector('input[name="phone"]')).toBeInTheDocument();

  expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/confirm password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create account/i })).not.toBeInTheDocument();
  });
});
