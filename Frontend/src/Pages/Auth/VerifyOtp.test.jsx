// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import VerifyOtp from './VerifyOtp';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyOtp } from '../slices/auth';

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

const { mockVerifyOtp } = vi.hoisted(() => {
  const verifyAction = vi.fn((payload) => ({ type: 'auth/verifyOtp', payload }));
  verifyAction.fulfilled = {
    match: vi.fn(() => true),
  };

  return {
    mockVerifyOtp: verifyAction,
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
  verifyOtp: mockVerifyOtp,
  resendOtp: vi.fn(() => ({ type: 'auth/resendOtp' })),
  clearError: vi.fn(() => ({ type: 'auth/clearError' })),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  localStorage.setItem(
    'registeredData',
    JSON.stringify({
      email: 'otpuser@example.com',
    })
  );

  mockDispatch.mockResolvedValue({ type: 'auth/verifyOtp/fulfilled' });
  useAppDispatch.mockReturnValue(mockDispatch);
  useAppSelector.mockImplementation((selector) =>
    selector({
      auth: {
        verifyLoading: false,
        verifyError: null,
        resendLoading: false,
        resendError: null,
      },
    })
  );
});

// Test to check if the VerifyOtp component renders the OTP input and verify button correctly
it('accepts valid 6-digit OTP and shows verification success message', async () => {
  const { container } = render(<VerifyOtp />);

  const otpInput = container.querySelector('input[name="otp"]');
  expect(otpInput).toBeInTheDocument();

  fireEvent.change(otpInput, { target: { value: '123456' } });
  fireEvent.click(screen.getByRole('button', { name: /verify otp/i }));

  await waitFor(() => {
    expect(verifyOtp).toHaveBeenCalledTimes(1);
  });

  expect(verifyOtp).toHaveBeenCalledWith({
    email: 'otpuser@example.com',
    otp: '123456',
  });

  const { toast } = await import('react-toastify');
  expect(toast.success).toHaveBeenCalledWith('Email verified successfully!');
  expect(mockNavigate).toHaveBeenCalledWith('/login');
});
