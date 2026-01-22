import React from "react";
import { Shield } from "lucide-react";

const KYCHeader = () => {
  return (
    <div className="bg-[#0F1A3D] text-white rounded-2xl p-6 flex items-start gap-4">
      <Shield size={24} className="shrink-0 mt-1" />
      <p className="text-sm sm:text-base leading-relaxed">
        To ensure platform security and trust, please complete identity verification before accessing the system.
      </p>
    </div>
  );
};

export default KYCHeader;
