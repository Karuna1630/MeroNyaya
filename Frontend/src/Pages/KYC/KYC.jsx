import { useState } from "react";
import { Formik, Form } from "formik";
import { Shield, User2, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import IdentityDocs from "./IdentityDocs";
import Declaration from "./Declaration";
import { PersonalValidationSchema } from "../utils/kyc/personalSchema";

const tabs = [
  { key: "personal", label: "Personal Information", icon: User2 },
  { key: "professional", label: "Professional Information", icon: Briefcase },
  { key: "identity", label: "Identity Documents", icon: FileText },
  { key: "declaration", label: "Declaration & Submit", icon: CheckCircle2 },
];

const KYC_DRAFT_KEY = "lawyer_kyc_draft";

// Combined initial values for all tabs
const initialFormValues = {
  // Personal Info
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  gender: "Female",
  permanentAddress: "",
  currentAddress: "",
  // Professional Info
  barCouncilNumber: "",
  lawFirmName: "",
  yearsOfExperience: "",
  consultationFee: "",
  specializations: [],
  availabilityDays: [],
  availableFrom: "",
  availableUntil: "",
  // Identity Documents
  citizenshipFront: null,
  citizenshipBack: null,
  lawyerLicense: null,
  passportPhoto: null,
  lawDegree: null,
  experienceCertificate: null,
  // Declaration
  confirmAccuracy: false,
  authorizeVerification: false,
  agreeTerms: false,
};

const KYC = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [completedTabs, setCompletedTabs] = useState([]);

  // Load draft on mount
  const loadDraft = () => {
    const savedDraft = localStorage.getItem(KYC_DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        return { ...initialFormValues, ...parsed };
      } catch (error) {
        console.error("Failed to load draft:", error);
        return initialFormValues;
      }
    }
    return initialFormValues;
  };

  const handleSaveDraft = (values) => {
    // Exclude file objects when saving to localStorage
    const { citizenshipFront, citizenshipBack, lawyerLicense, passportPhoto, lawDegree, experienceCertificate, ...formDataToSave } = values;
    localStorage.setItem(KYC_DRAFT_KEY, JSON.stringify(formDataToSave));
    toast.info("Draft saved successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleContinue = (stepKey, setTouched, validateForm) => {
    return async () => {
      // Validate only current step fields
      const errors = await validateForm();
      
      // Set touched for current step to show errors
      if (stepKey === "personal") {
        setTouched({
          fullName: true,
          email: true,
          phone: true,
          dob: true,
          gender: true,
          permanentAddress: true,
          currentAddress: true,
        });
      } else if (stepKey === "professional") {
        setTouched({
          barCouncilNumber: true,
          lawFirmName: true,
          yearsOfExperience: true,
          consultationFee: true,
          specializations: true,
          availabilityDays: true,
          availableFrom: true,
          availableUntil: true,
        });
      } else if (stepKey === "identity") {
        setTouched({
          citizenshipFront: true,
          citizenshipBack: true,
          lawyerLicense: true,
          passportPhoto: true,
          lawDegree: true,
          experienceCertificate: true,
        });
      }

      // Check if current step has errors
      const stepErrors = getStepErrors(errors, stepKey);
      
      if (Object.keys(stepErrors).length === 0) {
        // Move to next tab
        if (activeTab === "personal") {
          setCompletedTabs([...completedTabs, "personal"]);
          setActiveTab("professional");
        } else if (activeTab === "professional") {
          setCompletedTabs([...completedTabs, "professional"]);
          setActiveTab("identity");
        } else if (activeTab === "identity") {
          setCompletedTabs([...completedTabs, "identity"]);
          setActiveTab("declaration");
        }
      }
    };
  };

  const getStepErrors = (errors, stepKey) => {
    const stepFields = {
      personal: ["fullName", "email", "phone", "dob", "gender", "permanentAddress", "currentAddress"],
      professional: ["barCouncilNumber", "lawFirmName", "yearsOfExperience", "consultationFee", "specializations", "availabilityDays", "availableFrom", "availableUntil"],
      identity: ["citizenshipFront", "citizenshipBack", "lawyerLicense", "passportPhoto", "lawDegree", "experienceCertificate"],
      declaration: ["confirmAccuracy", "authorizeVerification", "agreeTerms"],
    };

    return Object.keys(errors).reduce((acc, key) => {
      if (stepFields[stepKey]?.includes(key)) {
        acc[key] = errors[key];
      }
      return acc;
    }, {});
  };

  const canAccessTab = (tabKey) => {
    if (tabKey === activeTab) return true;
    if (completedTabs.includes(tabKey)) return true;
    return false;
  };

  const handlePrevious = () => {
    const tabKeys = tabs.map(t => t.key);
    const currentIndex = tabKeys.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabKeys[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <ToastContainer />
      <div className="w-full max-w-6xl flex flex-col">
        
        {/* Header - Outside Card */}
        <div className="bg-[#0F1A3D] text-white rounded-t-2xl p-6 flex items-start gap-4">
          <Shield size={24} className="shrink-0 mt-1" />
          <p className="text-sm sm:text-base leading-relaxed">
            To ensure platform security and trust, please complete identity verification before accessing the system.
          </p>
        </div>

        {/* MAIN KYC CARD */}
        <div className="w-full bg-white rounded-b-2xl shadow-sm overflow-hidden flex flex-col flex-1">
        
          {/* Tabs */}
          <div className="px-6 pt-6 pb-0">
            <div className="flex gap-3 pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const isCompleted = completedTabs.includes(tab.key);

                return (
                  <button
                    key={tab.key}
                    disabled={!canAccessTab(tab.key)}
                    onClick={() => canAccessTab(tab.key) && setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                      ${
                        isActive
                          ? "bg-[#0F1A3D] text-white shadow-md"
                          : isCompleted
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 my-0 mt-4" />

          {/* Single Formik Instance for All Steps */}
          <Formik
            initialValues={loadDraft()}
            validationSchema={PersonalValidationSchema} // Will be updated per step
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ values, errors, setTouched, validateForm, handleChange }) => (
              <Form>
                {/* Scrollable Content */}
                <div className="px-6 py-6 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {activeTab === "personal" && (
                    <PersonalInfo formik={{ values }} />
                  )}
                  {activeTab === "professional" && (
                    <ProfessionalInfo
                      form={values}
                      onChange={handleChange}
                    />
                  )}
                  {activeTab === "identity" && (
                    <IdentityDocs
                      form={values}
                      onChange={handleChange}
                    />
                  )}
                  {activeTab === "declaration" && (
                    <Declaration
                      form={values}
                      onChange={handleChange}
                    />
                  )}
                </div>

                {/* Fixed Footer with Buttons */}
                <div className="border-t border-slate-200 px-6 py-4 bg-white flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSaveDraft(values)}
                    className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Save Draft
                  </button>

                  <div className="flex gap-3">
                    {activeTab !== "personal" && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="px-6 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                      >
                        Previous
                      </button>
                    )}
                    
                    {activeTab !== "declaration" && (
                      <button
                        type="button"
                        onClick={handleContinue(activeTab, setTouched, validateForm)}
                        className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#0F1A3D] hover:opacity-95 transition"
                      >
                        Continue
                      </button>
                    )}

                    {activeTab === "declaration" && (
                      <button
                        type="button"
                        onClick={() => {
                          const allChecked = values.confirmAccuracy && values.authorizeVerification && values.agreeTerms;
                          if (allChecked) {
                            // Prepare payload for API submission
                            const payload = {
                              // Personal Info
                              fullName: values.fullName,
                              email: values.email,
                              phone: values.phone,
                              dob: values.dob,
                              gender: values.gender,
                              permanentAddress: values.permanentAddress,
                              currentAddress: values.currentAddress,
                              // Professional Info
                              barCouncilNumber: values.barCouncilNumber,
                              lawFirmName: values.lawFirmName,
                              yearsOfExperience: values.yearsOfExperience,
                              consultationFee: values.consultationFee,
                              specializations: values.specializations,
                              availabilityDays: values.availabilityDays,
                              availableFrom: values.availableFrom,
                              availableUntil: values.availableUntil,
                              // Documents (file objects/URLs)
                              citizenshipFront: values.citizenshipFront,
                              citizenshipBack: values.citizenshipBack,
                              lawyerLicense: values.lawyerLicense,
                              passportPhoto: values.passportPhoto,
                              lawDegree: values.lawDegree,
                              experienceCertificate: values.experienceCertificate,
                              // Declaration
                              confirmAccuracy: values.confirmAccuracy,
                              authorizeVerification: values.authorizeVerification,
                              agreeTerms: values.agreeTerms,
                            };
                            
                            console.log("KYC Submission Payload:", payload);
                            // TODO: Send to API - dispatch(submitKYC(payload))
                            
                            toast.success("KYC application submitted successfully!", {
                              position: "top-right",
                              autoClose: 3000,
                            });
                            
                            // Clear draft after successful submission
                            localStorage.removeItem(KYC_DRAFT_KEY);
                          }
                        }}
                        disabled={!(values.confirmAccuracy && values.authorizeVerification && values.agreeTerms)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2
                          ${
                            values.confirmAccuracy && values.authorizeVerification && values.agreeTerms
                              ? "text-[#0F1A3D] bg-yellow-400 hover:bg-yellow-500"
                              : "text-slate-400 bg-slate-200 cursor-not-allowed"
                          }`}
                      >
                        <Shield size={16} />
                        Submit for Verification
                      </button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default KYC;

