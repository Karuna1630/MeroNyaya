// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ResetPassword from './ResetPassword';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetPassword } from '../slices/auth';

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

const { mockResetPassword } = vi.hoisted(() => {
  const resetAction = vi.fn((payload) => ({
    type: 'auth/resetPassword',
    payload,
  }));
  resetAction.fulfilled = {
    match: vi.fn(() => true),
  };

  return {
    mockResetPassword: resetAction,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../store/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}));

vi.mock('../slices/auth', () => ({
  resetPassword: mockResetPassword,
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

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  localStorage.setItem('forgotPasswordEmail', 'resetuser@example.com');
  localStorage.setItem('passwordResetToken', 'valid-reset-token');

  mockDispatch.mockResolvedValue({ type: 'auth/resetPassword/fulfilled' });
  useAppDispatch.mockReturnValue(mockDispatch);
  useAppSelector.mockImplementation((selector) =>
    selector({
      auth: {
        resetPasswordLoading: false,
        resetPasswordError: null,
      },
    })
  );
});

// Test to check if the ResetPassword component renders the form fields and reset button correctly
it('valid OTP token and new password trigger password reset success flow', async () => {
  const { container } = render(<ResetPassword />);

  const newPasswordInput = container.querySelector('input[name="new_password"]');
  const confirmPasswordInput = container.querySelector('input[name="confirm_password"]');

  expect(newPasswordInput).toBeInTheDocument();
  expect(confirmPasswordInput).toBeInTheDocument();

  fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
  fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

  await waitFor(() => {
    expect(resetPassword).toHaveBeenCalledTimes(1);
  });

  expect(resetPassword).toHaveBeenCalledWith({
    email: 'resetuser@example.com',
    reset_token: 'valid-reset-token',
    new_password: 'password123',
    confirm_password: 'password123',
  });

  await waitFor(() => {
    expect(localStorage.getItem('forgotPasswordEmail')).toBeNull();
    expect(localStorage.getItem('passwordResetToken')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      replace: true,
      state: {
        toastMessage: 'Password reset successful. Please login.',
      },
    });
  });
});
