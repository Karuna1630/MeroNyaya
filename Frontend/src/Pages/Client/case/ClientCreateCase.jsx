import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../sidebar';
import ClientDashHeader from '../ClientDashHeader';
import { FileText, Users, Upload, AlertCircle, Info } from 'lucide-react';
import { CreateCaseInitialValues, CreateCaseValidationSchema } from '../../utils/CreateCaseValidation';
import { LAW_CATEGORIES } from '../../../utils/lawCategories';
import { createCase, updateCase, fetchCaseById } from '../../slices/caseSlice';
import { fetchVerifiedLawyers } from '../../slices/lawyerSlice';

const caseCategories = LAW_CATEGORIES;

const ClientCreateCase = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const createCaseLoading = useSelector((state) => state.case?.createCaseLoading);
  const caseDetails = useSelector((state) => state.case?.caseDetails);
  const caseDetailsLoading = useSelector((state) => state.case?.caseDetailsLoading);
  const {
    verifiedLawyers,
    verifiedLawyersLoading,
    verifiedLawyersError,
  } = useSelector((state) => state.lawyer || {});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [lawyerSelectionMode, setLawyerSelectionMode] = useState('public');
  const [lawyerDropdownValue, setLawyerDropdownValue] = useState('');
  const [casePrivacy, setCasePrivacy] = useState('public');
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const formikRef = useRef();

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchCaseById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (caseDetails && isEditMode) {
      setCasePrivacy(caseDetails.status === 'draft' ? 'private' : 'public');
      setLawyerSelectionMode(caseDetails.lawyer_selection || 'public');
    }
  }, [caseDetails, isEditMode]);

  useEffect(() => {
    if (lawyerSelectionMode === 'specific') {
      dispatch(fetchVerifiedLawyers());
    }
  }, [dispatch, lawyerSelectionMode]);


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        case_title: values.caseTitle,
        case_category: values.caseCategory,
        case_description: values.caseDescription,
        opposing_party: values.opposingParty || '',
        urgency_level: values.urgencyLevel,
        lawyer_selection: values.lawyerSelection,
        preferred_lawyers: values.lawyerSelection === 'specific' ? values.selectedLawyerIds : [],
        request_consultation: isEditMode
          ? caseDetails?.request_consultation ?? false
          : false,
        status: casePrivacy === 'private' ? 'draft' : 'public',
        documents: uploadedFiles,
      };

      if (isEditMode) {
        await dispatch(updateCase({ caseId: id, data: payload })).unwrap();
        toast.success('Case updated successfully!');
        navigate('/clientcase');
      } else {
        await dispatch(createCase(payload)).unwrap();
        toast.success('Case submitted successfully!');
      }
      
      // Reset form and files after successful submission
      resetForm();
      setUploadedFiles([]);
    } catch (error) {
      toast.error(error?.message || 'Failed to submit case');
    } finally {
      setSubmitting(false);
    }
  };

  const maxCharacters = 2000;

  return (
    <>
      <ToastContainer />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <ClientDashHeader
            title={isEditMode ? 'Edit Case' : 'Create New Case'}
            subtitle={isEditMode
              ? 'Update your case details or change its privacy settings.'
              : 'Provide details about your legal issue to connect with suitable lawyers.'}
          />

          {/* Page Content */}
          <div className="p-8">
            {isEditMode && caseDetailsLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F1A3D] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading case details...</p>
                </div>
              </div>
            ) : (
            <>
            {/* Main Form Card */}
            <div className="max-w-4xl mx-auto">
              <Formik
                initialValues={isEditMode && caseDetails ? {
                  caseTitle: caseDetails.case_title || '',
                  caseCategory: caseDetails.case_category || '',
                  caseDescription: caseDetails.case_description || '',
                  opposingParty: caseDetails.opposing_party || '',
                  urgencyLevel: caseDetails.urgency_level || 'Medium',
                  lawyerSelection: caseDetails.lawyer_selection || 'public',
                  selectedLawyerIds: caseDetails.preferred_lawyers || [],
                } : CreateCaseInitialValues}
                validationSchema={CreateCaseValidationSchema}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validateOnBlur={true}
                enableReinitialize={isEditMode}
                innerRef={formikRef}
              >
                {({ values, isSubmitting, resetForm, setFieldValue, setFieldError, setFieldTouched }) => {
                  const selectedIds = Array.isArray(values.selectedLawyerIds)
                    ? values.selectedLawyerIds.map(String)
                    : [];
                  const selectedLawyers = (Array.isArray(verifiedLawyers) ? verifiedLawyers : []).filter(
                    (lawyer) => selectedIds.includes(String(lawyer.id))
                  );
                  const availableLawyers = (Array.isArray(verifiedLawyers) ? verifiedLawyers : []).filter(
                    (lawyer) => !selectedIds.includes(String(lawyer.id))
                  );

                  return (
                    <Form className="bg-white border border-gray-200 rounded-lg p-8">
              
              {/* Section 1: Case Information */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={20} className="text-[#0F1A3D]" />
                  <h2 className="text-lg font-semibold text-[#0F1A3D]">Case Information</h2>
                </div>

                {/* Case Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Title <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="text"
                    name="caseTitle"
                    placeholder="e.g., Property dispute in Lalitpur"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent"
                  />
                  <ErrorMessage
                    name="caseTitle"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Case Category */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Category <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="caseCategory"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent bg-white"
                  >
                    <option value="">Select a category</option>
                    {caseCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="caseCategory"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Case Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Description <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="textarea"
                    name="caseDescription"
                    placeholder="Describe your legal issue in detail..."
                    rows={6}
                    maxLength={maxCharacters}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">Explain your issue clearly so lawyers can understand your situation.</p>
                    <p className="text-xs text-gray-500">{values.caseDescription.length}/{maxCharacters}</p>
                  </div>
                  <ErrorMessage
                    name="caseDescription"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Opposing Party */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opposing Party <span className="text-gray-400">(Optional)</span>
                  </label>
                  <Field
                    type="text"
                    name="opposingParty"
                    placeholder="Name of the opposing party (if known)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the name of the person or entity you have a dispute with.</p>
                  <ErrorMessage
                    name="opposingParty"
                    component="p"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Section 2: Urgency Level */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle size={20} className="text-[#0F1A3D]" />
                  <h2 className="text-lg font-semibold text-[#0F1A3D]">Urgency Level</h2>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <Field
                      type="radio"
                      name="urgencyLevel"
                      value="Low"
                      className="w-4 h-4 text-[#0F1A3D] focus:ring-[#0F1A3D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Low</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <Field
                      type="radio"
                      name="urgencyLevel"
                      value="Medium"
                      className="w-4 h-4 text-[#0F1A3D] focus:ring-[#0F1A3D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Medium</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <Field
                      type="radio"
                      name="urgencyLevel"
                      value="High"
                      className="w-4 h-4 text-[#0F1A3D] focus:ring-[#0F1A3D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">High</span>
                  </label>
                </div>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Section 3: Lawyer Selection */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Users size={20} className="text-[#0F1A3D]" />
                  <h2 className="text-lg font-semibold text-[#0F1A3D]">Lawyer Selection</h2>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start cursor-pointer">
                    <Field
                      type="radio"
                      name="lawyerSelection"
                      value="specific"
                      className="w-4 h-4 mt-0.5 text-[#0F1A3D] focus:ring-[#0F1A3D]"
                      onChange={(e) => {
                        setFieldValue('lawyerSelection', e.target.value);
                        setLawyerSelectionMode('specific');
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">Send to a specific lawyer</span>
                  </label>

                  <label className="flex items-start cursor-pointer">
                    <Field
                      type="radio"
                      name="lawyerSelection"
                      value="public"
                      className="w-4 h-4 mt-0.5 text-[#0F1A3D] focus:ring-[#0F1A3D]"
                      onChange={(e) => {
                        setFieldValue('lawyerSelection', e.target.value);
                        setFieldValue('selectedLawyerIds', []);
                        setLawyerDropdownValue('');
                        setLawyerSelectionMode('public');
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">Make case public for all lawyers</span>
                  </label>
                </div>

                {values.lawyerSelection === 'specific' && (
                  <div className="mt-4 border border-gray-200 rounded-lg p-4 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Available Lawyers</label>
                    <select
                      value={lawyerDropdownValue}
                      onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;
                        if (selectedIds.includes(id)) {
                          setLawyerDropdownValue('');
                          return;
                        }
                        if (selectedIds.length >= 3) {
                          setFieldTouched('selectedLawyerIds', true, false);
                          setFieldError('selectedLawyerIds', 'You can select up to 3 lawyers');
                          setLawyerDropdownValue('');
                          return;
                        }
                        setFieldError('selectedLawyerIds', undefined);
                        setFieldValue('selectedLawyerIds', [...selectedIds, id]);
                        setLawyerDropdownValue('');
                      }}
                      disabled={verifiedLawyersLoading}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent bg-white disabled:bg-gray-100"
                    >
                      <option value="">Select a lawyer</option>
                      {availableLawyers.map((lawyer) => (
                        <option key={lawyer.id} value={String(lawyer.id)}>
                          {lawyer.name || 'Unnamed lawyer'}
                          {lawyer.city ? ` - ${lawyer.city}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">Select up to 3 lawyers</p>
                    {!verifiedLawyersLoading && !verifiedLawyersError && availableLawyers.length === 0 && (
                      <p className="text-xs text-gray-500">No lawyers available right now.</p>
                    )}

                    {selectedLawyers.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preferred lawyers</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLawyers.map((lawyer) => (
                            <span
                              key={lawyer.id}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-[#0F1A3D] text-xs font-medium rounded-full border border-blue-200 shadow-sm"
                            >
                              {lawyer.name}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = selectedIds.filter((item) => String(item) !== String(lawyer.id));
                                  setFieldValue('selectedLawyerIds', updated);
                                  if (updated.length <= 3) {
                                    setFieldError('selectedLawyerIds', undefined);
                                  }
                                }}
                                className="text-blue-700 hover:text-blue-900 cursor-pointer"
                                aria-label="Remove lawyer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {verifiedLawyersLoading && (
                      <p className="text-sm text-gray-500">Loading lawyers...</p>
                    )}
                    {verifiedLawyersError && (
                      <p className="text-sm text-red-500">{verifiedLawyersError}</p>
                    )}
                    <ErrorMessage
                      name="selectedLawyerIds"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                )}

                {values.lawyerSelection === 'public' && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                    <Info size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Your case will be visible to verified lawyers who can send you consultation offers.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 4: Case Documents */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Upload size={20} className="text-[#0F1A3D]" />
                  <h2 className="text-lg font-semibold text-[#0F1A3D]">Case Documents</h2>
                </div>

                {/* Upload Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-[#0F1A3D] bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <Upload size={40} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Drag & drop files here, or</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                      Upload Documents
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-4">Accepted: PDF, JPG, PNG (Max 10MB each)</p>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-700">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  Upload citizenship card, legal papers, contracts, or any relevant files.
                </p>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Section 5: Privacy & Terms */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Info size={20} className="text-[#0F1A3D]" />
                  <h2 className="text-lg font-semibold text-[#0F1A3D]">Privacy & Terms</h2>
                </div>

                <label className="flex items-start cursor-pointer">
                  <Field
                    type="checkbox"
                    name="privacyConfirmed"
                    className="w-4 h-4 mt-0.5 text-[#0F1A3D] focus:ring-[#0F1A3D] rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I confirm that the information provided is accurate and truthful.
                  </span>
                </label>
                <ErrorMessage
                  name="privacyConfirmed"
                  component="p"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setCancelConfirm(true)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting || createCaseLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createCaseLoading}
                  className="px-6 py-2.5 bg-[#0F1A3D] text-white rounded-lg text-sm font-medium hover:bg-[#1a2b5a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || createCaseLoading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Case' : 'Submit Case')}
                </button>
              </div>
            </Form>
                    );
                }}
              </Formik>
            </div>
            </>
            )}
          </div>
        </div>
        {/* Cancel Confirmation Modal */}
        {cancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Discard Changes</h2>
                <p className="text-sm text-slate-600 mt-2">
                  Are you sure you want to cancel? All unsaved data will be lost.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!isEditMode) {
                      formikRef.current?.resetForm();
                      setUploadedFiles([]);
                    }
                    setCancelConfirm(false);
                    navigate('/clientcase');
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                >
                  {isEditMode ? 'Go Back' : 'Discard'}
                </button>

                <button
                  onClick={() => setCancelConfirm(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientCreateCase;