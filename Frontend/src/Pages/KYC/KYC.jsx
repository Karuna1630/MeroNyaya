import { useState } from "react";
import { Formik, Form } from "formik";
import { Shield, User2, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import IdentityDocs from "./IdentityDocs";
import Declaration from "./Declaration";
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

const KYC = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [completedTabs, setCompletedTabs] = useState([]);

  const loadDraft = () => {
    const savedDraft = localStorage.getItem(KYC_DRAFT_KEY);
    if (savedDraft) {
      try {
        return { ...initialFormValues, ...JSON.parse(savedDraft) };
      } catch (error) {
        console.error("Failed to load draft:", error);
        return initialFormValues;
      }
    }
    return initialFormValues;
  };

  const handleSaveDraft = (values) => {
    const { citizenshipFront, citizenshipBack, lawyerLicense, passportPhoto, lawDegree, experienceCertificate, ...formDataToSave } = values;
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <ToastContainer />
      <div className="w-full max-w-6xl flex flex-col">
        
        <div className="bg-[#0F1A3D] text-white rounded-t-2xl p-6 flex items-start gap-4">
          <Shield size={24} className="shrink-0 mt-1" />
          <p className="text-sm sm:text-base leading-relaxed">
            To ensure platform security and trust, please complete identity verification before accessing the system.
          </p>
        </div>

        <div className="w-full bg-white rounded-b-2xl shadow-sm overflow-hidden flex flex-col flex-1">
        
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
                      ${isActive ? "bg-[#0F1A3D] text-white shadow-md" : isCompleted ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 my-0 mt-4" />

          <Formik
            initialValues={loadDraft()}
            validationSchema={stepSchemas[activeTab]}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ values, setTouched, validateForm }) => (
              <Form>
                <div className="px-6 py-6 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {activeTab === "personal" && <PersonalInfo />}
                  {activeTab === "professional" && <ProfessionalInfo />}
                  {activeTab === "identity" && <IdentityDocs />}
                  {activeTab === "declaration" && <Declaration />}
                </div>

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
                        onClick={handleContinue(setTouched, validateForm)}
                        className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#0F1A3D] hover:opacity-95 transition"
                      >
                        Continue
                      </button>
                    )}

                    {activeTab === "declaration" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (values.confirmAccuracy && values.authorizeVerification && values.agreeTerms) {
                            console.log("KYC Submission Payload:", values);
                            toast.success("KYC application submitted successfully!");
                            localStorage.removeItem(KYC_DRAFT_KEY);
                          }
                        }}
                        disabled={!(values.confirmAccuracy && values.authorizeVerification && values.agreeTerms)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2
                          ${values.confirmAccuracy && values.authorizeVerification && values.agreeTerms
                            ? "text-[#0F1A3D] bg-yellow-400 hover:bg-yellow-500"
                            : "text-slate-400 bg-slate-200 cursor-not-allowed"}`}
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

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #f1f5f9; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default KYC;

