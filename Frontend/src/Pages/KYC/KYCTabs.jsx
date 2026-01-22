import React from "react";
import { User2, Briefcase, FileText, CheckCircle2 } from "lucide-react";

const tabs = [
  { key: "personal", label: "Personal Information", icon: User2 },
  { key: "professional", label: "Professional Information", icon: Briefcase },
  { key: "identity", label: "Identity Documents", icon: FileText },
  { key: "declaration", label: "Declaration & Submit", icon: CheckCircle2 },
];

const KYCTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold border transition ${
              isActive
                ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
