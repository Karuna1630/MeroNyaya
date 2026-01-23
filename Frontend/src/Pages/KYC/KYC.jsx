import { useState, useEffect } from "react";
import { Shield, User2, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import IdentityDocs from "./IdentityDocs";
import Declaration from "./Declaration";

const tabs = [
  { key: "personal", label: "Personal Information", icon: User2 },
  { key: "professional", label: "Professional Information", icon: Briefcase },
  { key: "identity", label: "Identity Documents", icon: FileText },
  { key: "declaration", label: "Declaration & Submit", icon: CheckCircle2 },
];

const KYC_DRAFT_KEY = "lawyer_kyc_draft";


const KYC = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [completedTabs, setCompletedTabs] = useState([]);

  const [form, setForm] = useState({
    fullName: "Adv. Ram Kumar",
    email: "ram.kumar@example.com",
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
  });

  useEffect(() => {
    const savedDraft = localStorage.getItem(KYC_DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Exclude file fields when restoring
        const { citizenshipFront, citizenshipBack, lawyerLicense, passportPhoto, lawDegree, experienceCertificate, ...restData } = parsed;
        setForm((prev) => ({ ...prev, ...restData }));
      } catch (error) {
        console.error("Failed to restore draft:", error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDraft = () => {
    // Exclude file objects when saving to localStorage
    const { citizenshipFront, citizenshipBack, lawyerLicense, passportPhoto, lawDegree, experienceCertificate, ...formDataToSave } = form;
    localStorage.setItem(KYC_DRAFT_KEY, JSON.stringify(formDataToSave));
    alert("Draft saved successfully! Note: Uploaded files will need to be re-uploaded.");
  };


  const handleContinue = () => {
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
  };

  const handlePrevious = () => {
    if (activeTab === "professional") {
      setActiveTab("personal");
    } else if (activeTab === "identity") {
      setActiveTab("professional");
    } else if (activeTab === "declaration") {
      setActiveTab("identity");
    }
  };

  const canAccessTab = (tabKey) => {
  if (tabKey === activeTab) return true;
  if (completedTabs.includes(tabKey)) return true;
  return false;
};


  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
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

          {/* Scrollable Content */}
          <div className="px-6 py-6 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {activeTab === "personal" && (
              <PersonalInfo
                form={form}
                onChange={handleChange}
              />
            )}
            {activeTab === "professional" && (
              <ProfessionalInfo
                form={form}
                onChange={handleChange}
              />
            )}
            {activeTab === "identity" && (
              <IdentityDocs
                form={form}
                onChange={handleChange}
              />
            )}
            {activeTab === "declaration" && (
              <Declaration
                form={form}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="border-t border-slate-200 px-6 py-4 bg-white flex items-center justify-between">
            <button
              onClick={handleSaveDraft}
              className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Save Draft
            </button>

            <div className="flex gap-3">
              {activeTab !== "personal" && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                >
                  Previous
                </button>
              )}
              
              {activeTab !== "declaration" && (
                <button
                  onClick={handleContinue}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#0F1A3D] hover:opacity-95 transition"
                >
                  Continue
                </button>
              )}

              {activeTab === "declaration" && (
                <button
                  onClick={() => {
                    const allChecked = form.confirmAccuracy && form.authorizeVerification && form.agreeTerms;
                    if (allChecked) {
                      console.log("Form submitted:", form);
                      alert("KYC application submitted successfully!");
                    }
                  }}
                  disabled={!(form.confirmAccuracy && form.authorizeVerification && form.agreeTerms)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2
                    ${
                      form.confirmAccuracy && form.authorizeVerification && form.agreeTerms
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

