// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import KYC from './KYC';
import { useDispatch, useSelector } from 'react-redux';
import { submitKyc } from '../slices/kycSlice';

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

const {
  mockSubmitKyc,
  mockUpdateKyc,
  mockClearKycState,
  mockFetchMyKyc,
  mockFetchKycStatus,
} = vi.hoisted(() => {
  const submitAction = vi.fn((payload) => ({ type: 'kyc/submit', payload }));
  submitAction.fulfilled = {
    match: vi.fn(() => false),
  };

  const updateAction = vi.fn((payload) => ({ type: 'kyc/update', payload }));
  updateAction.fulfilled = {
    match: vi.fn(() => false),
  };

  return {
    mockSubmitKyc: submitAction,
    mockUpdateKyc: updateAction,
    mockClearKycState: vi.fn(() => ({ type: 'kyc/clearKycState' })),
    mockFetchMyKyc: vi.fn(() => ({ type: 'kyc/fetchMyKyc' })),
    mockFetchKycStatus: vi.fn(() => ({ type: 'kyc/fetchKycStatus' })),
  };
});

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

vi.mock('../slices/kycSlice', () => ({
  submitKyc: mockSubmitKyc,
  updateKyc: mockUpdateKyc,
  clearKycState: mockClearKycState,
  fetchMyKyc: mockFetchMyKyc,
  fetchKycStatus: mockFetchKycStatus,
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ToastContainer: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockDispatch.mockResolvedValue({ type: 'kyc/submit/rejected' });

  useDispatch.mockReturnValue(mockDispatch);
  useSelector.mockImplementation((selector) =>
    selector({
      kyc: {
        submitLoading: false,
        submitError: null,
        status: null,
        myKyc: null,
      },
      profile: {
        userProfile: null,
      },
    })
  );

  localStorage.clear();
});

// Test to check if the KYC form can be filled out and submitted successfully, triggering the submitKyc API call with correct data
it('lawyer fills required KYC fields and submit triggers API call once', async () => {
  const { container } = render(<KYC />);

  fireEvent.change(container.querySelector('input[name="fullName"]'), {
    target: { value: 'Lawyer User' },
  });
  fireEvent.change(container.querySelector('input[name="email"]'), {
    target: { value: 'lawyeruser@example.com' },
  });
  fireEvent.change(container.querySelector('input[name="phone"]'), {
    target: { value: '9812345678' },
  });
  fireEvent.change(container.querySelector('input[name="dob"]'), {
    target: { value: '1990-01-01' },
  });
  fireEvent.change(container.querySelector('select[name="gender"]'), {
    target: { value: 'Male' },
  });
  fireEvent.change(container.querySelector('textarea[name="permanentAddress"]'), {
    target: { value: 'Kathmandu, Nepal' },
  });
  fireEvent.change(container.querySelector('textarea[name="currentAddress"]'), {
    target: { value: 'Lalitpur, Nepal' },
  });

  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  await waitFor(() => {
    expect(container.querySelector('input[name="barCouncilNumber"]')).toBeInTheDocument();
  });

  fireEvent.change(container.querySelector('input[name="barCouncilNumber"]'), {
    target: { value: 'NPC-12345' },
  });
  fireEvent.change(container.querySelector('select[name="yearsOfExperience"]'), {
    target: { value: '3-5' },
  });
  fireEvent.change(container.querySelector('input[name="consultationFee"]'), {
    target: { value: '2000' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Criminal Law' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sunday' }));
  fireEvent.change(container.querySelector('input[name="availableFrom"]'), {
    target: { value: '09:00' },
  });
  fireEvent.change(container.querySelector('input[name="availableUntil"]'), {
    target: { value: '17:00' },
  });
  fireEvent.change(container.querySelector('input[name="esewaNumber"]'), {
    target: { value: '9812345678' },
  });
  fireEvent.change(container.querySelector('input[name="khaltiNumber"]'), {
    target: { value: '9712345678' },
  });

  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  await waitFor(() => {
    expect(container.querySelector('#citizenshipFront')).toBeInTheDocument();
  });

  const file = new File(['document'], 'doc.pdf', { type: 'application/pdf' });
  const requiredDocs = [
    'citizenshipFront',
    'citizenshipBack',
    'lawyerLicense',
    'passportPhoto',
    'lawDegree',
    'experienceCertificate',
  ];

  requiredDocs.forEach((id) => {
    fireEvent.change(container.querySelector(`#${id}`), {
      target: { files: [file] },
    });
  });

  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  await waitFor(() => {
    expect(screen.getByText(/I confirm that all the information provided above/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText(/I confirm that all the information provided above/i));
  fireEvent.click(screen.getByText(/I authorize MeroNyaya to verify my credentials/i));
  fireEvent.click(screen.getByText(/I agree to the/i));

  const submitButton = screen.getByRole('button', { name: /submit for verification/i });
  expect(submitButton).toBeEnabled();

  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(submitKyc).toHaveBeenCalledTimes(1);
  });

  expect(submitKyc).toHaveBeenCalledWith(
    expect.objectContaining({
      fullName: 'Lawyer User',
      email: 'lawyeruser@example.com',
      phone: '9812345678',
      barCouncilNumber: 'NPC-12345',
      consultationFee: 2000,
      confirmAccuracy: true,
      authorizeVerification: true,
      agreeTerms: true,
    })
  );
});
