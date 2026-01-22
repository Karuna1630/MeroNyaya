import { useState } from "react";
import { Shield, User2, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import IdentityDocs from "./IdentityDocs";

const tabs = [
  { key: "personal", label: "Personal Information", icon: User2 },
  { key: "professional", label: "Professional Information", icon: Briefcase },
  { key: "identity", label: "Identity Documents", icon: FileText },
  { key: "declaration", label: "Declaration & Submit", icon: CheckCircle2 },
];



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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-6xl">
        
        {/* Header - Outside Card */}
        <div className="bg-[#0F1A3D] text-white rounded-t-2xl p-6 flex items-start gap-4">
          <Shield size={24} className="shrink-0 mt-1" />
          <p className="text-sm sm:text-base leading-relaxed">
            To ensure platform security and trust, please complete identity verification before accessing the system.
          </p>
        </div>

        {/* MAIN KYC CARD - Without top padding */}
        <div className="w-full bg-white rounded-b-2xl shadow-sm overflow-hidden">
        
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
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                      ${
                        isActive
                          ? "bg-[#0F1A3D] text-white shadow-md"
                          : isCompleted
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-500"
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
                onSaveDraft={() => console.log("Draft saved")}
                onContinue={() => {
                  setCompletedTabs([...completedTabs, "personal"]);
                  setActiveTab("professional");
                }}
              />
            )}
            {activeTab === "professional" && (
              <ProfessionalInfo
                form={form}
                onChange={handleChange}
                onSaveDraft={() => console.log("Draft saved")}
                onContinue={() => {
                  setCompletedTabs([...completedTabs, "professional"]);
                  setActiveTab("identity");
                }}
              />
            )}
            {activeTab === "identity" && (
              <IdentityDocs
                form={form}
                onChange={handleChange}
                onSaveDraft={() => console.log("Draft saved")}
                onContinue={() => {
                  setCompletedTabs([...completedTabs, "identity"]);
                  setActiveTab("declaration");
                }}
              />
            )}
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

