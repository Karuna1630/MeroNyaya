import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../sidebar';
import ClientDashHeader from '../ClientDashHeader';
import { FileText, Users, Calendar, Upload, AlertCircle, Info } from 'lucide-react';
import { CreateCaseInitialValues, CreateCaseValidationSchema } from '../../utils/CreateCaseValidation';
import { createCase } from '../../slices/caseSlice';
import { fetchVerifiedLawyers } from '../../slices/lawyerSlice';

const caseCategories = [
  "Family Law",
  "Property Law",
  "Criminal Law",
  "Corporate Law",
  "Civil Litigation",
  "Banking & Finance",
  "Labor Law",
  "Immigration Law",
  "Insurance Law",
  "Tort Law",
];

const ClientCreateCase = () => {
  const dispatch = useDispatch();
  const createCaseLoading = useSelector((state) => state.case?.createCaseLoading);
  const {
    verifiedLawyers,
    verifiedLawyersLoading,
    verifiedLawyersError,
  } = useSelector((state) => state.lawyer || {});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [lawyerSelectionMode, setLawyerSelectionMode] = useState('public');
  const [lawyerSearchTerm, setLawyerSearchTerm] = useState('');

  useEffect(() => {
    if (lawyerSelectionMode === 'specific') {
      dispatch(fetchVerifiedLawyers());
    }
  }, [dispatch, lawyerSelectionMode]);

  const filteredLawyers = useMemo(() => {
    const list = Array.isArray(verifiedLawyers) ? verifiedLawyers : [];
    if (!lawyerSearchTerm.trim()) return [];
    const term = lawyerSearchTerm.toLowerCase();
    return list.filter((lawyer) => (lawyer.name || '').toLowerCase().includes(term));
  }, [verifiedLawyers, lawyerSearchTerm]);


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
        urgency_level: values.urgencyLevel,
        lawyer_selection: values.lawyerSelection,
        preferred_lawyers: values.lawyerSelection === 'specific' ? values.selectedLawyerIds : [],
        request_consultation: values.requestConsultation,
        documents: uploadedFiles,
      };

      await dispatch(createCase(payload)).unwrap();
      toast.success('Case submitted successfully!');
      
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
          <ClientDashHeader />

          {/* Page Content */}
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#0F1A3D] mb-2">Create New Case</h1>
              <p className="text-sm text-gray-600">Provide details about your legal issue to connect with suitable lawyers.</p>
            </div>

            {/* Main Form Card */}
            <div className="max-w-4xl mx-auto">
              <Formik
                initialValues={CreateCaseInitialValues}
                validationSchema={CreateCaseValidationSchema}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validateOnBlur={true}
              >
                {({ values, isSubmitting, resetForm, setFieldValue, setFieldError, setFieldTouched }) => {
                  const selectedIds = Array.isArray(values.selectedLawyerIds)
                    ? values.selectedLawyerIds.map(String)
                    : [];
                  const selectedLawyers = (Array.isArray(verifiedLawyers) ? verifiedLawyers : []).filter(
                    (lawyer) => selectedIds.includes(String(lawyer.id))
                  );
                  const availableLawyers = filteredLawyers.filter(
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
                <div className="mb-2">
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
                        setLawyerSelectionMode('public');
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">Make case public for all lawyers</span>
                  </label>
                </div>

                {values.lawyerSelection === 'specific' && (
                  <div className="mt-4 border border-gray-200 rounded-lg p-4 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Search Lawyer</label>
                    <input
                      type="text"
                      value={lawyerSearchTerm}
                      onChange={(e) => setLawyerSearchTerm(e.target.value)}
                      placeholder="Search by lawyer name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500">Select up to 3 lawyers</p>

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

                    {verifiedLawyersLoading ? (
                      <p className="text-sm text-gray-500">Loading lawyers...</p>
                    ) : verifiedLawyersError ? (
                      <p className="text-sm text-red-500">{verifiedLawyersError}</p>
                    ) : lawyerSearchTerm.trim() ? (
                      <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg">
                        {availableLawyers.length === 0 ? (
                          <p className="text-sm text-gray-500 p-3">No lawyers found.</p>
                        ) : (
                          availableLawyers.map((lawyer) => (
                            <button
                              key={lawyer.id}
                              type="button"
                              onClick={() => {
                                const id = String(lawyer.id);
                                if (selectedIds.includes(id)) {
                                  return;
                                }
                                if (selectedIds.length >= 3) {
                                  setFieldTouched('selectedLawyerIds', true, false);
                                  setFieldError('selectedLawyerIds', 'You can select up to 3 lawyers');
                                  return;
                                }
                                setFieldError('selectedLawyerIds', undefined);
                                setFieldValue('selectedLawyerIds', [...selectedIds, id]);
                              }}
                              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                                ''
                              }`}
                            >
                              <p className="text-sm font-medium text-[#0F1A3D]">{lawyer.name}</p>
                              <p className="text-xs text-gray-500">
                                {lawyer.city || 'Unknown city'}{lawyer.law_firm_name ? ` • ${lawyer.law_firm_name}` : ''}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Start typing to see matching lawyers.</p>
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

              <hr className="my-8 border-gray-200" />

              {/* Section 4: Consultation Preference */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar size={20} className="text-[#0F1A3D]" />
                  <h2 className="text-lg font-semibold text-[#0F1A3D]">Consultation Preference</h2>
                </div>

                <label className="flex items-start cursor-pointer">
                  <Field
                    type="checkbox"
                    name="requestConsultation"
                    className="w-4 h-4 mt-0.5 text-[#0F1A3D] focus:ring-[#0F1A3D] rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">I want to request a consultation for this case</span>
                </label>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Section 5: Case Documents */}
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

              {/* Section 6: Privacy & Terms */}
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
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel? All data will be lost.')) {
                      resetForm();
                      setUploadedFiles([]);
                    }
                  }}
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
                  {isSubmitting || createCaseLoading ? 'Submitting...' : 'Submit Case'}
                </button>
              </div>
            </Form>
                    );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientCreateCase;