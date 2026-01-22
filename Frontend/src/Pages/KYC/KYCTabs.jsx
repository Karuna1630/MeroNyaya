import { User2, Briefcase, FileText, CheckCircle2 } from "lucide-react";

const tabs = [
  { key: "personal", label: "Personal Information", icon: User2 },
  { key: "professional", label: "Professional Information", icon: Briefcase },
  { key: "identity", label: "Identity Documents", icon: FileText },
  { key: "declaration", label: "Declaration & Submit", icon: CheckCircle2 },
];

const KYCTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-[#F2F4F7] rounded-2xl p-2 mt-6 flex gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all
              ${
                isActive
                  ? "bg-[#0F1A3D] text-white shadow-sm"
                  : "bg-[#F7F8FB] text-slate-600"
              }`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default KYCTabs;
