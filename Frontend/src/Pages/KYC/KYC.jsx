import { useState } from "react";
import KYCHeader from "./KYCHeader";
import KYCTabs from "./KYCtabs";
import PersonalInfo from "./PersonalInfo";

const KYC = () => {
  // Active tab
  const [activeTab, setActiveTab] = useState("personal");

  // Form state (ONLY personal for now)
  const [form, setForm] = useState({
    fullName: "Adv. Ram Kumar",
    email: "ram.kumar@example.com",
    phone: "",
    dob: "",
    gender: "Female",
    permanentAddress: "",
    currentAddress: "",
  });

  //  Change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Actions
  const handleSaveDraft = () => {
    console.log("Draft saved:", form);
  };

  const handleContinue = () => {
    setActiveTab("professional");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <KYCHeader />

      <KYCTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="bg-white rounded-2xl p-6 border">
        {activeTab === "personal" && (
          <PersonalInfo
            form={form}
            onChange={handleChange}
            onSaveDraft={handleSaveDraft}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  );
};

export default KYC;
