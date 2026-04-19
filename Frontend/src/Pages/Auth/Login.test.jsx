// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Login from './Login';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser } from '../slices/auth';

const mockDispatch = vi.fn();

const { mockLoginUser } = vi.hoisted(() => {
  const loginAction = vi.fn((payload) => ({ type: 'auth/login', payload }));
  loginAction.fulfilled = {
    match: vi.fn(() => false),
  };

  return {
    mockLoginUser: loginAction,
  };
});

vi.mock('../store/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}));

vi.mock('../slices/auth', () => ({
  loginUser: mockLoginUser,
  clearError: vi.fn(() => ({ type: 'auth/clearError' })),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

vi.mock('../../components/Header', () => ({
  default: () => null,
}));

vi.mock('../../components/Footer', () => ({
  default: () => null,
}));

vi.mock('../../assets/login image.jpg', () => ({
  default: 'login-image.jpg',
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockDispatch.mockResolvedValue({ type: 'auth/login/rejected' });
  useAppDispatch.mockReturnValue(mockDispatch);
  useAppSelector.mockImplementation((selector) =>
    selector({ auth: { loading: false, error: null } })
  );
});

// Test to check if the Login component renders the form fields and login button correctly
it('accepts valid email/password and calls login action once', async () => {
  const { container } = render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const emailInput = container.querySelector('input[name="email"]');
  const passwordInput = container.querySelector('input[name="password"]');

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();

  fireEvent.change(emailInput, { target: { value: 'client@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(loginUser).toHaveBeenCalledTimes(1);
  });

  expect(loginUser).toHaveBeenCalledWith({
    email: 'client@example.com',
    password: 'password123',
  });
});
