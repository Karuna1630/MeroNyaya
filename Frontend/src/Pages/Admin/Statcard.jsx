import React from "react";

const Statcard = ({ icon, title, value, subtitle, bgColor = "bg-blue-100", iconColor = "text-blue-900" }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow">
      <div className={`p-3 rounded-lg ${bgColor} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default Statcard;
