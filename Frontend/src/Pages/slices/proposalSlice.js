import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

// Fetch all proposals (for lawyers - their proposals, for clients - proposals for their cases)
export const fetchProposals = createAsyncThunk(
	'proposals/fetchProposals',
	async (filters = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			if (filters.status) params.append('status', filters.status);
			if (filters.case_id) params.append('case_id', filters.case_id);
			
			const query = params.toString();
			const response = await axiosInstance.get(`/proposals/${query ? `?${query}` : ''}`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to load proposals');
		}
	}
);

// Submit a new proposal (lawyers only)
export const submitProposal = createAsyncThunk(
	'proposals/submitProposal',
	async ({ caseId, proposalText }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post('/proposals/', {
				case: caseId,
				proposal_text: proposalText,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to submit proposal');
		}
	}
);

// Accept a proposal (clients only)
export const acceptProposal = createAsyncThunk(
	'proposals/acceptProposal',
	async (proposalId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`/proposals/${proposalId}/accept/`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'Failed to accept proposal');
		}
	}
);

// Reject a proposal (clients only)
export const rejectProposal = createAsyncThunk(
	'proposals/rejectProposal',
	async ({ proposalId, feedback }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`/proposals/${proposalId}/reject/`, {
				client_feedback: feedback,
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'Failed to reject proposal');
		}
	}
);

// Withdraw a proposal (lawyers only)
export const withdrawProposal = createAsyncThunk(
	'proposals/withdrawProposal',
	async (proposalId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`/proposals/${proposalId}/withdraw/`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'Failed to withdraw proposal');
		}
	}
);

const initialState = {
	proposals: [],
	proposalsLoading: false,
	proposalsError: null,

	submitProposalLoading: false,
	submitProposalSuccess: false,
	submitProposalError: null,

	acceptProposalLoading: false,
	acceptProposalError: null,

	rejectProposalLoading: false,
	rejectProposalError: null,

	withdrawProposalLoading: false,
	withdrawProposalError: null,
};

const proposalSlice = createSlice({
	name: 'proposals',
	initialState,
	reducers: {
		clearSubmitProposalStatus: (state) => {
			state.submitProposalLoading = false;
			state.submitProposalSuccess = false;
			state.submitProposalError = null;
		},
		clearProposalErrors: (state) => {
			state.proposalsError = null;
			state.submitProposalError = null;
			state.acceptProposalError = null;
			state.rejectProposalError = null;
			state.withdrawProposalError = null;
		},
		clearProposals: (state) => {
			state.proposals = [];
			state.proposalsError = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch proposals
			.addCase(fetchProposals.pending, (state) => {
				state.proposalsLoading = true;
				state.proposalsError = null;
			})
			.addCase(fetchProposals.fulfilled, (state, action) => {
				state.proposalsLoading = false;
				state.proposals = Array.isArray(action.payload)
					? action.payload
					: action.payload.results || [];
			})
			.addCase(fetchProposals.rejected, (state, action) => {
				state.proposalsLoading = false;
				state.proposalsError = action.payload;
			})
			// Submit proposal
			.addCase(submitProposal.pending, (state) => {
				state.submitProposalLoading = true;
				state.submitProposalSuccess = false;
				state.submitProposalError = null;
			})
			.addCase(submitProposal.fulfilled, (state, action) => {
				state.submitProposalLoading = false;
				state.submitProposalSuccess = true;
				state.proposals = [action.payload, ...state.proposals];
			})
			.addCase(submitProposal.rejected, (state, action) => {
				state.submitProposalLoading = false;
				state.submitProposalError = action.payload;
			})
			// Accept proposal
			.addCase(acceptProposal.pending, (state) => {
				state.acceptProposalLoading = true;
				state.acceptProposalError = null;
			})
			.addCase(acceptProposal.fulfilled, (state, action) => {
				state.acceptProposalLoading = false;
				const updated = action.payload;
				state.proposals = state.proposals.map((item) =>
					item.id === updated.id ? updated : item
				);
			})
			.addCase(acceptProposal.rejected, (state, action) => {
				state.acceptProposalLoading = false;
				state.acceptProposalError = action.payload;
			})
			// Reject proposal
			.addCase(rejectProposal.pending, (state) => {
				state.rejectProposalLoading = true;
				state.rejectProposalError = null;
			})
			.addCase(rejectProposal.fulfilled, (state, action) => {
				state.rejectProposalLoading = false;
				const updated = action.payload;
				state.proposals = state.proposals.map((item) =>
					item.id === updated.id ? updated : item
				);
			})
			.addCase(rejectProposal.rejected, (state, action) => {
				state.rejectProposalLoading = false;
				state.rejectProposalError = action.payload;
			})
			// Withdraw proposal
			.addCase(withdrawProposal.pending, (state) => {
				state.withdrawProposalLoading = true;
				state.withdrawProposalError = null;
			})
			.addCase(withdrawProposal.fulfilled, (state, action) => {
				state.withdrawProposalLoading = false;
				const updated = action.payload;
				state.proposals = state.proposals.map((item) =>
					item.id === updated.id ? updated : item
				);
			})
			.addCase(withdrawProposal.rejected, (state, action) => {
				state.withdrawProposalLoading = false;
				state.withdrawProposalError = action.payload;
			});
	},
});

export const {
	clearSubmitProposalStatus,
	clearProposalErrors,
	clearProposals,
} = proposalSlice.actions;

export default proposalSlice.reducer;
