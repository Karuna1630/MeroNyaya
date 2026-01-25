import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

// Helper to convert camelCase form values to snake_case expected by backend
const buildKycFormData = (values) => {
	const fieldMap = {
		// Personal
		fullName: 'full_name',
		email: 'email',
		phone: 'phone',
		dob: 'dob',
		gender: 'gender',
		permanentAddress: 'permanent_address',
		currentAddress: 'current_address',
		// Professional
		barCouncilNumber: 'bar_council_number',
		lawFirmName: 'law_firm_name',
		yearsOfExperience: 'years_of_experience',
		consultationFee: 'consultation_fee',
		specializations: 'specializations',
		availabilityDays: 'availability_days',
		availableFrom: 'available_from',
		availableUntil: 'available_until',
		// Documents
		citizenshipFront: 'citizenship_front',
		citizenshipBack: 'citizenship_back',
		lawyerLicense: 'lawyer_license',
		passportPhoto: 'passport_photo',
		lawDegree: 'law_degree',
		experienceCertificate: 'experience_certificate',
		// Declaration
		confirmAccuracy: 'confirm_accuracy',
		authorizeVerification: 'authorize_verification',
		agreeTerms: 'agree_terms',
	};

	const formData = new FormData();

	Object.entries(fieldMap).forEach(([srcKey, destKey]) => {
		const value = values?.[srcKey];
		if (value === undefined || value === null) return;

		// Arrays need to be stringified for JSONField
		if (Array.isArray(value)) {
			formData.append(destKey, JSON.stringify(value));
		} else {
			formData.append(destKey, value);
		}
	});

	return formData;
};

// Extract a human-friendly message from API error shapes
const extractErrorMessage = (payload) => {
	if (!payload) return 'Operation failed.';
	if (typeof payload === 'string') return payload;

	const errorMessage = payload.ErrorMessage;
	if (typeof errorMessage === 'string' && errorMessage.trim()) {
		return errorMessage;
	}

	if (errorMessage && typeof errorMessage === 'object') {
		const firstEntry = Object.values(errorMessage)[0];
		if (Array.isArray(firstEntry) && firstEntry.length > 0) {
			return firstEntry[0];
		}
		if (typeof firstEntry === 'string') {
			return firstEntry;
		}
	}

	if (payload.Result?.message) {
		return payload.Result.message;
	}

	return 'Operation failed.';
};

/* ================= SUBMIT KYC ================= */
export const submitKyc = createAsyncThunk(
	'kyc/submit',
	async (formValues, { rejectWithValue }) => {
		try {
			const formData = buildKycFormData(formValues);
			const response = await axiosInstance.post('/kyc/submit/', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

/* ================= FETCH MY KYC ================= */
export const fetchMyKyc = createAsyncThunk(
	'kyc/fetchMyKyc',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get('/kyc/my-kyc/');
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

/* ================= UPDATE KYC (rejected only) ================= */
export const updateKyc = createAsyncThunk(
	'kyc/update',
	async (formValues, { rejectWithValue }) => {
		try {
			const formData = buildKycFormData(formValues);
			const response = await axiosInstance.put('/kyc/update/', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

/* ================= KYC STATUS CHECK ================= */
export const fetchKycStatus = createAsyncThunk(
	'kyc/fetchKycStatus',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.get('/kyc/status/');
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || error.message);
		}
	}
);

/* ================= INITIAL STATE ================= */
const initialState = {
	myKyc: null,
	status: null,

	submitLoading: false,
	submitError: null,
	submitSuccess: false,

	fetchLoading: false,
	fetchError: null,
	fetchSuccess: false,

	updateLoading: false,
	updateError: null,
	updateSuccess: false,

	statusLoading: false,
	statusError: null,
	statusSuccess: false,
};

/* ================= SLICE ================= */
const kycSlice = createSlice({
	name: 'kyc',
	initialState,
	reducers: {
		clearKycState: (state) => {
			state.submitError = null;
			state.fetchError = null;
			state.updateError = null;
			state.statusError = null;
			state.submitSuccess = false;
			state.fetchSuccess = false;
			state.updateSuccess = false;
			state.statusSuccess = false;
		},
	},
	extraReducers: (builder) => {
		/* Submit KYC */
		builder.addCase(submitKyc.pending, (state) => {
			state.submitLoading = true;
			state.submitError = null;
			state.submitSuccess = false;
		});

		builder.addCase(submitKyc.fulfilled, (state, action) => {
			state.submitLoading = false;
			state.myKyc = action.payload.Result ?? action.payload; // backend may wrap in Result
			state.submitSuccess = true;
		});

		builder.addCase(submitKyc.rejected, (state, action) => {
			state.submitLoading = false;
			state.submitError = extractErrorMessage(action.payload);
			state.submitSuccess = false;
		});

		/* Fetch My KYC */
		builder.addCase(fetchMyKyc.pending, (state) => {
			state.fetchLoading = true;
			state.fetchError = null;
			state.fetchSuccess = false;
		});

		builder.addCase(fetchMyKyc.fulfilled, (state, action) => {
			state.fetchLoading = false;
			state.myKyc = action.payload.Result ?? action.payload;
			state.fetchSuccess = true;
		});

		builder.addCase(fetchMyKyc.rejected, (state, action) => {
			state.fetchLoading = false;
			state.fetchError = extractErrorMessage(action.payload);
			state.fetchSuccess = false;
		});

		/* Update KYC */
		builder.addCase(updateKyc.pending, (state) => {
			state.updateLoading = true;
			state.updateError = null;
			state.updateSuccess = false;
		});

		builder.addCase(updateKyc.fulfilled, (state, action) => {
			state.updateLoading = false;
			state.myKyc = action.payload.Result ?? action.payload;
			state.updateSuccess = true;
		});

		builder.addCase(updateKyc.rejected, (state, action) => {
			state.updateLoading = false;
			state.updateError = extractErrorMessage(action.payload);
			state.updateSuccess = false;
		});

		/* Fetch KYC Status */
		builder.addCase(fetchKycStatus.pending, (state) => {
			state.statusLoading = true;
			state.statusError = null;
			state.statusSuccess = false;
		});

		builder.addCase(fetchKycStatus.fulfilled, (state, action) => {
			state.statusLoading = false;
			state.status = action.payload.Result ?? action.payload;
			state.statusSuccess = true;
		});

		builder.addCase(fetchKycStatus.rejected, (state, action) => {
			state.statusLoading = false;
			state.statusError = extractErrorMessage(action.payload);
			state.statusSuccess = false;
		});
	},
});

export const { clearKycState } = kycSlice.actions;
export default kycSlice.reducer;
