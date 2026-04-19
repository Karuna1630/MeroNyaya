// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ForgotPassword from './ForgotPassword';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { requestPasswordResetOtp } from '../slices/auth';

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

const { mockRequestPasswordResetOtp } = vi.hoisted(() => {
  const requestAction = vi.fn((payload) => ({
    type: 'auth/requestPasswordResetOtp',
    payload,
  }));
  requestAction.fulfilled = {
    match: vi.fn(() => true),
  };

  return {
    mockRequestPasswordResetOtp: requestAction,
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
  requestPasswordResetOtp: mockRequestPasswordResetOtp,
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

  mockDispatch.mockResolvedValue({ type: 'auth/requestPasswordResetOtp/fulfilled' });
  useAppDispatch.mockReturnValue(mockDispatch);
  useAppSelector.mockImplementation((selector) =>
    selector({
      auth: {
        forgotPasswordLoading: false,
        forgotPasswordError: null,
      },
    })
  );
});

// Test to check if the ForgotPassword component accepts email input and shows OTP sent confirmation
it('accepts email and shows OTP sent confirmation', async () => {
  const { container } = render(<ForgotPassword />);

  const emailInput = container.querySelector('input[name="email"]');
  expect(emailInput).toBeInTheDocument();

  fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /send otp/i }));

  await waitFor(() => {
    expect(requestPasswordResetOtp).toHaveBeenCalledTimes(1);
  });

  expect(requestPasswordResetOtp).toHaveBeenCalledWith({
    email: 'user@example.com',
  });

  const { toast } = await import('react-toastify');
  expect(toast.success).toHaveBeenCalledWith('OTP sent to your email.');
  expect(localStorage.getItem('forgotPasswordEmail')).toBe('user@example.com');
  expect(mockNavigate).toHaveBeenCalledWith('/forgot-password/verify-otp');
});
