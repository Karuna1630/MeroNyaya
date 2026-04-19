// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import LawyerProposal from './LawyerProposal';
import { useDispatch, useSelector } from 'react-redux';

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '101' }),
  };
});

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('../../slices/proposalSlice', () => ({
  fetchProposals: vi.fn((payload) => ({ type: 'proposals/fetchProposals', payload })),
  acceptProposal: vi.fn((proposalId) => ({ type: 'proposals/acceptProposal', payload: proposalId })),
  rejectProposal: vi.fn((payload) => ({ type: 'proposals/rejectProposal', payload })),
}));

vi.mock('../../slices/caseSlice', () => ({
  fetchCases: vi.fn(() => ({ type: 'cases/fetchCases' })),
}));

vi.mock('../sidebar', () => ({
  default: () => null,
}));

vi.mock('../ClientDashHeader', () => ({
  default: () => null,
}));

vi.mock('../../../components/Pagination', () => ({
  default: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();

  useDispatch.mockReturnValue(mockDispatch);
  useSelector.mockImplementation((selector) =>
    selector({
      proposal: {
        proposals: [
          {
            id: 1,
            case: 101,
            lawyer_name: 'Advocate Sita Sharma',
            lawyer_email: 'sita.lawyer@example.com',
            proposal_text: 'I can represent you for this property dispute case.',
            status: 'pending',
            created_at: '2026-04-01T12:00:00Z',
          },
        ],
        proposalsLoading: false,
        proposalsError: null,
        acceptProposalLoading: false,
        acceptProposalError: null,
        rejectProposalLoading: false,
        rejectProposalError: null,
      },
      case: {
        cases: [
          {
            id: 101,
            case_category: 'Property Law',
            case_title: 'Property title dispute',
            case_description: 'Dispute over land ownership documents',
            created_at: '2026-03-31T09:00:00Z',
            proposal_count: 1,
          },
        ],
      },
    })
  );
});

// Test case to check if the LawyerProposal component renders the proposal list with correct data from the store
it('client can open proposal list page and at least one proposal card renders', () => {
  render(<LawyerProposal />);

  expect(screen.getByText(/proposals \(1\)/i)).toBeInTheDocument();
  expect(screen.getByText('Advocate Sita Sharma')).toBeInTheDocument();
  expect(screen.getByText(/property dispute case/i)).toBeInTheDocument();
});
