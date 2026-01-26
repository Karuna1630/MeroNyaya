import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import { Shield, User2, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import IdentityDocs from "./IdentityDocs";
import Declaration from "./Declaration";
import { submitKyc, clearKycState } from "../slices/kycSlice";
import { PersonalValidationSchema } from "../utils/kyc/PersonalSchema";
import { ProfessionalValidationSchema } from "../utils/kyc/ProfessionalSchema";
import { IdentityValidationSchema } from "../utils/kyc/IdentitySchema";
import { DeclarationValidationSchema } from "../utils/kyc/DeclerationSchema";

const tabs = [
  { key: "personal", label: "Personal Information", icon: User2 },
  { key: "professional", label: "Professional Information", icon: Briefcase },
  { key: "identity", label: "Identity Documents", icon: FileText },
  { key: "declaration", label: "Declaration & Submit", icon: CheckCircle2 },
];

const KYC_DRAFT_KEY = "lawyer_kyc_draft";

const initialFormValues = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  gender: "Female",
  permanentAddress: "",
  currentAddress: "",
  barCouncilNumber: "",
  lawFirmName: "",
  yearsOfExperience: "",
  consultationFee: "",
  specializations: [],
  availabilityDays: [],
  availableFrom: "",
  availableUntil: "",
  citizenshipFront: null,
  citizenshipBack: null,
  lawyerLicense: null,
  passportPhoto: null,
  lawDegree: null,
  experienceCertificate: null,
  confirmAccuracy: false,
  authorizeVerification: false,
  agreeTerms: false,
};

const stepSchemas = {
  personal: PersonalValidationSchema,
  professional: ProfessionalValidationSchema,
  identity: IdentityValidationSchema,
  declaration: DeclarationValidationSchema,
};

const stepFields = {
  personal: ["fullName", "email", "phone", "dob", "gender", "permanentAddress", "currentAddress"],
  professional: ["barCouncilNumber", "lawFirmName", "yearsOfExperience", "consultationFee", "specializations", "availabilityDays", "availableFrom", "availableUntil"],
  identity: ["citizenshipFront", "citizenshipBack", "lawyerLicense", "passportPhoto", "lawDegree", "experienceCertificate"],
  declaration: ["confirmAccuracy", "authorizeVerification", "agreeTerms"],
};

const KYC = ({ onClose }) => {
  const dispatch = useDispatch();
  const { submitLoading, submitError } = useSelector((state) => state.kyc || {});
  const { userProfile } = useSelector((state) => state.profile);
  const [activeTab, setActiveTab] = useState("personal");
  const [completedTabs, setCompletedTabs] = useState([]);
  const submissionToastShownRef = useRef(false);

  const loadDraft = () => {
    const savedDraft = localStorage.getItem(KYC_DRAFT_KEY);
    
    // Pre-fill personal info from user profile
    const profileData = {
      fullName: userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.phone || "",
      dob: userProfile?.date_of_birth || "",
      gender: userProfile?.gender || "Female",
      permanentAddress: userProfile?.permanent_address || "",
      currentAddress: userProfile?.current_address || "",
    };

    if (savedDraft) {
      try {
        return { ...initialFormValues, ...profileData, ...JSON.parse(savedDraft) };
      } catch (error) {
        console.error("Failed to load draft:", error);
        return { ...initialFormValues, ...profileData };
      }
    }
    return { ...initialFormValues, ...profileData };
  };

  const handleSaveDraft = (values) => {
    const { citizenshipFront: _CITIZENSHIP_FRONT, citizenshipBack: _CITIZENSHIP_BACK, lawyerLicense: _LAWYER_LICENSE, passportPhoto: _PASSPORT_PHOTO, lawDegree: _LAW_DEGREE, experienceCertificate: _EXPERIENCE_CERTIFICATE, ...formDataToSave } = values;
    localStorage.setItem(KYC_DRAFT_KEY, JSON.stringify(formDataToSave));
    toast.info("Draft saved successfully!");
  };

  const getStepErrors = (errors, stepKey) => {
    return stepFields[stepKey]?.reduce((acc, key) => {
      if (errors[key]) acc[key] = errors[key];
      return acc;
    }, {}) || {};
  };

  const handleContinue = (setTouched, validateForm) => {
    return async () => {
      const errors = await validateForm();
      const stepErrors = getStepErrors(errors, activeTab);

      if (Object.keys(stepErrors).length === 0) {
        setCompletedTabs([...completedTabs, activeTab]);
        const tabKeys = tabs.map(t => t.key);
        const nextIndex = tabKeys.indexOf(activeTab) + 1;
        if (nextIndex < tabKeys.length) {
          setActiveTab(tabKeys[nextIndex]);
        }
      } else {
        setTouched(Object.keys(stepErrors).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}));
      }
    };
  };

  const canAccessTab = (tabKey) => activeTab === tabKey || completedTabs.includes(tabKey);

  const handlePrevious = () => {
    const tabKeys = tabs.map(t => t.key);
    const currentIndex = tabKeys.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabKeys[currentIndex - 1]);
    }
  };

  const handleSubmitKyc = async (values) => {
    if (!(values.confirmAccuracy && values.authorizeVerification && values.agreeTerms)) {
      return;
    }
    try {
      const action = await dispatch(submitKyc(values));
      if (submitKyc.fulfilled.match(action)) {
        if (!submissionToastShownRef.current) {
          toast.success("KYC application submitted successfully!");
          submissionToastShownRef.current = true;
        }
        localStorage.removeItem(KYC_DRAFT_KEY);
        // Close modal after successful submission
        setTimeout(() => {
          onClose?.();
          dispatch(clearKycState());
        }, 1500);
      } else {
        const errorMessage = submitError || action.payload?.message || "Submission failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(error?.message || "Submission failed");
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      <ToastContainer />
      
        {/* Fixed Header */}
        <div className="bg-[#0F1A3D] text-white p-6 flex items-start gap-4 shrink-0">
          <Shield size={24} className="shrink-0 mt-1" />
          <p className="text-sm sm:text-base leading-relaxed">
            To ensure platform security and trust, please complete identity verification before accessing the system.
          </p>
        </div>

        <div className="w-full bg-white overflow-hidden flex flex-col flex-1 min-h-0">
        
          {/* Fixed Tabs */}
          <div className="px-6 pt-6 pb-0 shrink-0">
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
                      ${isActive ? "bg-[#0F1A3D] text-white shadow-md" : isCompleted ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 my-0 mt-4 shrink-0" />

          <Formik
            initialValues={loadDraft()}
            validationSchema={stepSchemas[activeTab]}
            validateOnChange={true}
            validateOnBlur={true}
            enableReinitialize={true}
          >
            {({ values, setTouched, validateForm }) => (
              <Form className="flex flex-col flex-1 min-h-0">
                {/* Scrollable Content Area */}
                <div className="flex-1 px-6 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {activeTab === "personal" && <PersonalInfo />}
                  {activeTab === "professional" && <ProfessionalInfo />}
                  {activeTab === "identity" && <IdentityDocs />}
                  {activeTab === "declaration" && <Declaration />}
                </div>

                {/* Fixed Footer */}
                <div className="border-t border-slate-200 px-6 py-4 bg-white flex items-center justify-between shrink-0">
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
                        onClick={handleContinue(setTouched, validateForm)}
                        className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#0F1A3D] hover:opacity-95 transition"
                      >
                        Continue
                      </button>
                    )}

                    {activeTab === "declaration" && (
                      <button
                        type="button"
                        onClick={() => handleSubmitKyc(values)}
                        disabled={submitLoading || !(values.confirmAccuracy && values.authorizeVerification && values.agreeTerms)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2
                          ${values.confirmAccuracy && values.authorizeVerification && values.agreeTerms && !submitLoading
                            ? "text-[#0F1A3D] bg-yellow-400 hover:bg-yellow-500"
                            : "text-slate-400 bg-slate-200 cursor-not-allowed"}`}
                      >
                        <Shield size={16} />
                        {submitLoading ? "Submitting..." : "Submit for Verification"}
                      </button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
    </div>
  );
};

export default KYC;

