import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

const buildFormData = (payload) => {
	const formData = new FormData();
	Object.entries(payload || {}).forEach(([key, value]) => {
		if (key === 'documents' && Array.isArray(value)) {
			value.forEach((file) => formData.append('documents', file));
		} else if (Array.isArray(value)) {
			value.forEach((item) => formData.append(key, item));
		} else if (value !== undefined && value !== null) {
			formData.append(key, value);
		}
	});
	return formData;
};

export const fetchCases = createAsyncThunk(
	'cases/fetchCases',
	async (filters = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			if (filters.status) params.append('status', filters.status);
			if (filters.case_category) params.append('case_category', filters.case_category);
			if (filters.urgency_level) params.append('urgency_level', filters.urgency_level);
			if (filters.search) params.append('search', filters.search);
			if (filters.ordering) params.append('ordering', filters.ordering);

			const query = params.toString();
			const response = await axiosInstance.get(`/cases/${query ? `?${query}` : ''}`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to load cases');
		}
	}
);

export const fetchCaseById = createAsyncThunk(
	'cases/fetchCaseById',
	async (caseId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get(`/cases/${caseId}/`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to load case');
		}
	}
);

export const createCase = createAsyncThunk(
	'cases/createCase',
	async (payload, { rejectWithValue }) => {
		try {
			const body = payload instanceof FormData ? payload : buildFormData(payload);
			const response = await axiosInstance.post('/cases/', body, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to create case');
		}
	}
);

export const updateCase = createAsyncThunk(
	'cases/updateCase',
	async ({ caseId, data }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.patch(`/cases/${caseId}/`, data);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update case');
		}
	}
);

export const deleteCase = createAsyncThunk(
	'cases/deleteCase',
	async (caseId, { rejectWithValue }) => {
		try {
			await axiosInstance.delete(`/cases/${caseId}/`);
			return caseId;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to delete case');
		}
	}
);

export const fetchPublicCases = createAsyncThunk(
	'cases/fetchPublicCases',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get('/cases/public_cases/');
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to load public cases');
		}
	}
);

export const fetchCaseAppointments = createAsyncThunk(
	'cases/fetchCaseAppointments',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get('/cases/appointments/');
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to load case appointments');
		}
	}
);

export const uploadCaseDocuments = createAsyncThunk(
	'cases/uploadCaseDocuments',
	async ({ caseId, files }, { rejectWithValue }) => {
		try {
			const formData = new FormData();
			(files || []).forEach((file) => formData.append('documents', file));

			const response = await axiosInstance.post(`/cases/${caseId}/upload_documents/`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return { caseId, documents: response.data };
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to upload documents');
		}
	}
);

export const acceptCase = createAsyncThunk(
	'cases/acceptCase',
	async (caseId, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`/cases/${caseId}/accept_case/`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to accept case');
		}
	}
);

export const updateCaseStatus = createAsyncThunk(
	'cases/updateCaseStatus',
	async ({ caseId, status }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.patch(`/cases/${caseId}/update_status/`, { status });
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update status');
		}
	}
);

export const updateCaseDetails = createAsyncThunk(
	'cases/updateCaseDetails',
	async ({ caseId, data }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.patch(`/cases/${caseId}/update_case_details/`, data);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update case details');
		}
	}
);

export const addTimelineEvent = createAsyncThunk(
	'cases/addTimelineEvent',
	async ({ caseId, eventData }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`/cases/${caseId}/add_timeline_event/`, eventData);
			return { caseId, event: response.data };
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to add timeline event');
		}
	}
);
export const scheduleCaseAppointment = createAsyncThunk(
	'cases/scheduleCaseAppointment',
	async ({ caseId, data }, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(`/cases/${caseId}/schedule_meeting/`, data);
			return { caseId, appointment: response.data };
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to schedule case appointment');
		}
	}
);

const initialState = {
	cases: [],
	casesLoading: false,
	casesError: null,

	caseDetails: null,
	caseDetailsLoading: false,
	caseDetailsError: null,

	publicCases: [],
	publicCasesLoading: false,
	publicCasesError: null,

	caseAppointments: [],
	caseAppointmentsLoading: false,
	caseAppointmentsError: null,

	createCaseLoading: false,
	createCaseSuccess: false,
	createCaseError: null,

	updateCaseLoading: false,
	updateCaseError: null,

	deleteCaseLoading: false,
	deleteCaseError: null,

	uploadDocumentsLoading: false,
	uploadDocumentsError: null,

	addTimelineEventLoading: false,
	addTimelineEventError: null,

	scheduleCaseAppointmentLoading: false,
	scheduleCaseAppointmentError: null,

	acceptCaseLoading: false,
	acceptCaseError: null,

	updateStatusLoading: false,
	updateStatusError: null,
};

const caseSlice = createSlice({
	name: 'cases',
	initialState,
	reducers: {
		clearCreateCaseStatus: (state) => {
			state.createCaseLoading = false;
			state.createCaseSuccess = false;
			state.createCaseError = null;
		},
		clearCaseDetails: (state) => {
			state.caseDetails = null;
			state.caseDetailsError = null;
		},
		clearPublicCases: (state) => {
			state.publicCases = [];
			state.publicCasesError = null;
		},
		clearCaseErrors: (state) => {
			state.casesError = null;
			state.caseDetailsError = null;
			state.publicCasesError = null;
			state.createCaseError = null;
			state.updateCaseError = null;
			state.deleteCaseError = null;
			state.uploadDocumentsError = null;
			state.acceptCaseError = null;
			state.updateStatusError = null;
			state.addTimelineEventError = null;
			state.scheduleCaseAppointmentError = null;
			state.caseAppointmentsError = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCases.pending, (state) => {
				state.casesLoading = true;
				state.casesError = null;
			})
			.addCase(fetchCases.fulfilled, (state, action) => {
				state.casesLoading = false;
				state.cases = Array.isArray(action.payload)
					? action.payload
					: action.payload.results || [];
			})
			.addCase(fetchCases.rejected, (state, action) => {
				state.casesLoading = false;
				state.casesError = action.payload;
			})
			.addCase(fetchCaseById.pending, (state) => {
				state.caseDetailsLoading = true;
				state.caseDetailsError = null;
			})
			.addCase(fetchCaseById.fulfilled, (state, action) => {
				state.caseDetailsLoading = false;
				state.caseDetails = action.payload;
			})
			.addCase(fetchCaseById.rejected, (state, action) => {
				state.caseDetailsLoading = false;
				state.caseDetailsError = action.payload;
			})
			.addCase(createCase.pending, (state) => {
				state.createCaseLoading = true;
				state.createCaseSuccess = false;
				state.createCaseError = null;
			})
			.addCase(createCase.fulfilled, (state, action) => {
				state.createCaseLoading = false;
				state.createCaseSuccess = true;
				state.cases = [action.payload, ...state.cases];
			})
			.addCase(createCase.rejected, (state, action) => {
				state.createCaseLoading = false;
				state.createCaseError = action.payload;
			})
			.addCase(updateCase.pending, (state) => {
				state.updateCaseLoading = true;
				state.updateCaseError = null;
			})
			.addCase(updateCase.fulfilled, (state, action) => {
				state.updateCaseLoading = false;
				const updated = action.payload;
				state.cases = state.cases.map((item) => (item.id === updated.id ? updated : item));
				if (state.caseDetails?.id === updated.id) {
					state.caseDetails = updated;
				}
			})
			.addCase(updateCase.rejected, (state, action) => {
				state.updateCaseLoading = false;
				state.updateCaseError = action.payload;
			})
			.addCase(deleteCase.pending, (state) => {
				state.deleteCaseLoading = true;
				state.deleteCaseError = null;
			})
			.addCase(deleteCase.fulfilled, (state, action) => {
				state.deleteCaseLoading = false;
				state.cases = state.cases.filter((item) => item.id !== action.payload);
				if (state.caseDetails?.id === action.payload) {
					state.caseDetails = null;
				}
			})
			.addCase(deleteCase.rejected, (state, action) => {
				state.deleteCaseLoading = false;
				state.deleteCaseError = action.payload;
			})
			.addCase(fetchPublicCases.pending, (state) => {
				state.publicCasesLoading = true;
				state.publicCasesError = null;
			})
			.addCase(fetchPublicCases.fulfilled, (state, action) => {
				state.publicCasesLoading = false;
				state.publicCases = Array.isArray(action.payload)
					? action.payload
					: action.payload.results || [];
			})
			.addCase(fetchPublicCases.rejected, (state, action) => {
				state.publicCasesLoading = false;
				state.publicCasesError = action.payload;
			})
			.addCase(fetchCaseAppointments.pending, (state) => {
				state.caseAppointmentsLoading = true;
				state.caseAppointmentsError = null;
			})
			.addCase(fetchCaseAppointments.fulfilled, (state, action) => {
				state.caseAppointmentsLoading = false;
				state.caseAppointments = Array.isArray(action.payload)
					? action.payload
					: action.payload.results || [];
			})
			.addCase(fetchCaseAppointments.rejected, (state, action) => {
				state.caseAppointmentsLoading = false;
				state.caseAppointmentsError = action.payload;
			})
			.addCase(uploadCaseDocuments.pending, (state) => {
				state.uploadDocumentsLoading = true;
				state.uploadDocumentsError = null;
			})
			.addCase(uploadCaseDocuments.fulfilled, (state, action) => {
				state.uploadDocumentsLoading = false;
				const { caseId, documents } = action.payload;
				
				// Update the case in cases array
				state.cases = state.cases.map((item) => 
					item.id === caseId
						? {
								...item,
								documents: [...(item.documents || []), ...documents],
						  }
						: item
				);
				
				// Also update caseDetails if it matches
				if (state.caseDetails?.id === caseId) {
					state.caseDetails = {
						...state.caseDetails,
						documents: [...(state.caseDetails.documents || []), ...documents],
					};
				}
			})
			.addCase(uploadCaseDocuments.rejected, (state, action) => {
				state.uploadDocumentsLoading = false;
				state.uploadDocumentsError = action.payload;
			})
			.addCase(acceptCase.pending, (state) => {
				state.acceptCaseLoading = true;
				state.acceptCaseError = null;
			})
			.addCase(acceptCase.fulfilled, (state, action) => {
				state.acceptCaseLoading = false;
				const updated = action.payload;
				state.publicCases = state.publicCases.filter((item) => item.id !== updated.id);
				state.cases = state.cases.map((item) => (item.id === updated.id ? updated : item));
				if (state.caseDetails?.id === updated.id) {
					state.caseDetails = updated;
				}
			})
			.addCase(acceptCase.rejected, (state, action) => {
				state.acceptCaseLoading = false;
				state.acceptCaseError = action.payload;
			})
			.addCase(updateCaseStatus.pending, (state) => {
				state.updateStatusLoading = true;
				state.updateStatusError = null;
			})
			.addCase(updateCaseStatus.fulfilled, (state, action) => {
				state.updateStatusLoading = false;
				const updated = action.payload;
				state.cases = state.cases.map((item) => (item.id === updated.id ? updated : item));
				if (state.caseDetails?.id === updated.id) {
					state.caseDetails = updated;
				}
			})
			.addCase(updateCaseStatus.rejected, (state, action) => {
				state.updateStatusLoading = false;
				state.updateStatusError = action.payload;
			})
			.addCase(updateCaseDetails.pending, (state) => {
				state.updateCaseLoading = true;
				state.updateCaseError = null;
			})
			.addCase(updateCaseDetails.fulfilled, (state, action) => {
				state.updateCaseLoading = false;
				const updated = action.payload;
				state.cases = state.cases.map((item) => (item.id === updated.id ? updated : item));
				if (state.caseDetails?.id === updated.id) {
					state.caseDetails = updated;
				}
			})
			.addCase(updateCaseDetails.rejected, (state, action) => {
				state.updateCaseLoading = false;
				state.updateCaseError = action.payload;
			})
			.addCase(addTimelineEvent.pending, (state) => {
				state.addTimelineEventLoading = true;
				state.addTimelineEventError = null;
			})
			.addCase(addTimelineEvent.fulfilled, (state, action) => {
				state.addTimelineEventLoading = false;
				const { caseId, event } = action.payload;
				
				// Update the case in cases array
				state.cases = state.cases.map((item) => 
					item.id === caseId
						? {
								...item,
								timeline: [...(item.timeline || []), event],
						  }
						: item
				);
				
				// Also update caseDetails if it matches
				if (state.caseDetails?.id === caseId) {
					state.caseDetails = {
						...state.caseDetails,
						timeline: [...(state.caseDetails.timeline || []), event],
					};
				}
			})
			.addCase(addTimelineEvent.rejected, (state, action) => {
				state.addTimelineEventLoading = false;
				state.addTimelineEventError = action.payload;
			})
			.addCase(scheduleCaseAppointment.pending, (state) => {
				state.scheduleCaseAppointmentLoading = true;
				state.scheduleCaseAppointmentError = null;
			})
			.addCase(scheduleCaseAppointment.fulfilled, (state) => {
				state.scheduleCaseAppointmentLoading = false;
			})
			.addCase(scheduleCaseAppointment.rejected, (state, action) => {
				state.scheduleCaseAppointmentLoading = false;
				state.scheduleCaseAppointmentError = action.payload;
			});
	},
});

export const {
	clearCreateCaseStatus,
	clearCaseDetails,
	clearPublicCases,
	clearCaseErrors,
} = caseSlice.actions;

export default caseSlice.reducer;
