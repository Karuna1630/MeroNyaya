// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Consultationrequest from './Consultationrequest';
import { useDispatch, useSelector } from 'react-redux';
import { createConsultation } from '../slices/consultationSlice';

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

const { mockCreateConsultation } = vi.hoisted(() => ({
  mockCreateConsultation: vi.fn((payload) => ({
    type: 'consultation/createConsultation',
    payload,
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('../slices/consultationSlice.js', () => ({
  createConsultation: mockCreateConsultation,
}));

vi.mock('../Utils/AuthGate.jsx', () => ({
  default: ({ children }) => children,
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockDispatch.mockResolvedValue({ error: null });
  useDispatch.mockReturnValue(mockDispatch);
  useSelector.mockImplementation((selector) =>
    selector({
      consultation: {
        createLoading: false,
      },
      auth: {
        isAuthenticated: true,
      },
    })
  );
});

// Test case to check if client can select date/time and request consultation successfully, with correct data sent to the store and navigation to consultation list page
it('client selects date/time and booking request is sent successfully', async () => {
  const lawyer = {
    id: 55,
    name: 'Advocate Hari Karki',
    fee: 2500,
    availabilityDays: ['Mon', 'Tue', 'Wed'],
    availableFrom: '09:00',
    availableUntil: '17:00',
  };

  const user = {
    user_type: 'client',
  };

  render(<Consultationrequest lawyer={lawyer} user={user} />);

  fireEvent.click(screen.getByRole('button', { name: 'Tue' }));
  fireEvent.click(screen.getByRole('button', { name: '11:00 AM' }));
  fireEvent.click(screen.getByRole('button', { name: /book consultation/i }));

  fireEvent.change(screen.getByLabelText(/consultation topic/i), {
    target: { value: 'Property ownership consultation' },
  });

  const requestButton = screen.getByRole('button', { name: /request consultation/i });
  await waitFor(() => {
    expect(requestButton).toBeEnabled();
  });

  fireEvent.click(requestButton);

  await waitFor(() => {
    expect(createConsultation).toHaveBeenCalledTimes(1);
  });

  expect(createConsultation).toHaveBeenCalledWith(
    expect.objectContaining({
      lawyer_id: 55,
      mode: 'video',
      requested_day: 'Tue',
      requested_time: '11:00 AM',
      title: 'Property ownership consultation',
    })
  );

  expect(mockNavigate).toHaveBeenCalledWith('/client/consultation');
});
