import React from "react";

const Statcard = ({ icon, title, value, subtitle, bgColor = "bg-blue-100", iconColor = "text-blue-900" }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition-shadow">
      <div className={`p-2 rounded-lg ${bgColor} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default Statcard;
