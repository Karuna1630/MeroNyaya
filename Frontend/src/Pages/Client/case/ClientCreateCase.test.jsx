// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClientCreateCase from './ClientCreateCase';
import { useDispatch, useSelector } from 'react-redux';
import { createCase } from '../../slices/caseSlice';

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

const {
  mockCreateCase,
  mockUpdateCase,
  mockFetchCaseById,
  mockFetchVerifiedLawyers,
} = vi.hoisted(() => {
  return {
    mockCreateCase: vi.fn((payload) => ({ type: 'cases/createCase', payload })),
    mockUpdateCase: vi.fn((payload) => ({ type: 'cases/updateCase', payload })),
    mockFetchCaseById: vi.fn((id) => ({ type: 'cases/fetchCaseById', payload: id })),
    mockFetchVerifiedLawyers: vi.fn(() => ({ type: 'lawyer/fetchVerifiedLawyers' })),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('../../slices/caseSlice', () => ({
  createCase: mockCreateCase,
  updateCase: mockUpdateCase,
  fetchCaseById: mockFetchCaseById,
}));

vi.mock('../../slices/lawyerSlice', () => ({
  fetchVerifiedLawyers: mockFetchVerifiedLawyers,
}));

vi.mock('../sidebar', () => ({
  default: () => null,
}));

vi.mock('../ClientDashHeader', () => ({
  default: () => null,
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockDispatch.mockImplementation(() => ({
    unwrap: () => Promise.resolve({ id: 1 }),
  }));

  useDispatch.mockReturnValue(mockDispatch);
  useSelector.mockImplementation((selector) =>
    selector({
      case: {
        createCaseLoading: false,
        caseDetails: null,
        caseDetailsLoading: false,
      },
      lawyer: {
        verifiedLawyers: [],
        verifiedLawyersLoading: false,
        verifiedLawyersError: null,
      },
    })
  );
});

// Test case for successful case creation with required fields filled and success toast shown, and navigation to case list page
it('client fills required case fields and sees case created success toast', async () => {
  const { container } = render(<ClientCreateCase />);

  fireEvent.change(container.querySelector('input[name="caseTitle"]'), {
    target: { value: 'Property dispute against neighbor in Kathmandu' },
  });

  fireEvent.change(container.querySelector('select[name="caseCategory"]'), {
    target: { value: 'Property Law' },
  });

  fireEvent.change(container.querySelector('textarea[name="caseDescription"]'), {
    target: {
      value:
        'I need legal support for an ongoing property boundary dispute and title verification process with clear representation in court.',
    },
  });

  fireEvent.click(container.querySelector('input[name="privacyConfirmed"]'));
  fireEvent.click(container.querySelector('input[name="termsAccepted"]'));

  fireEvent.click(screen.getByRole('button', { name: /submit case/i }));

  await waitFor(() => {
    expect(createCase).toHaveBeenCalledTimes(1);
  });

  expect(createCase).toHaveBeenCalledWith(
    expect.objectContaining({
      case_title: 'Property dispute against neighbor in Kathmandu',
      case_category: 'Property Law',
      lawyer_selection: 'public',
      status: 'public',
    })
  );

  const { toast } = await import('react-toastify');
  expect(toast.success).toHaveBeenCalledWith('Case submitted successfully!');
  expect(mockNavigate).toHaveBeenCalledWith('/clientcase');
});
