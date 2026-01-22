import React from "react";
import { Briefcase } from "lucide-react";

const specializations = [
  "Criminal Law",
  "Civil Law",
  "Family Law",
  "Property Law",
  "Corporate Law",
  "Labor Law",
  "Constitutional Law",
  "Environmental Law",
  "Tax Law",
  "Immigration Law",
];

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const ProfessionalInfo = ({ form, onChange, onSaveDraft, onContinue }) => {
  const handleCheckboxChange = (field, value) => {
    const currentValues = form[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange({
      target: {
        name: field,
        value: newValues,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Briefcase size={20} className="text-slate-700" />
        <h2 className="text-lg font-semibold text-[#0F1A3D]">Professional Information</h2>
      </div>

      {/* Form Grid */}
      <div className="space-y-5">
        {/* Row 1: Nepal Bar Council & Law Firm Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Nepal Bar Council Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="barCouncilNumber"
              value={form.barCouncilNumber || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
              placeholder="e.g., NPC-XXXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">Law Firm Name (Optional)</label>
            <input
              type="text"
              name="lawFirmName"
              value={form.lawFirmName || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
              placeholder="Enter law firm name"
            />
          </div>
        </div>

        {/* Row 2: Years of Experience & Consultation Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <select
              name="yearsOfExperience"
              value={form.yearsOfExperience || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            >
              <option value="">Select experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Consultation Fee (NPR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="consultationFee"
              value={form.consultationFee || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
              placeholder="e.g., 2000"
            />
          </div>
        </div>

        {/* Row 3: Area of Specialization */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Area of Specialization <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => {
              const isSelected = (form.specializations || []).includes(spec);
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => handleCheckboxChange("specializations", spec)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                    ${
                      isSelected
                        ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                    }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Availability Days */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Availability Days <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => {
              const isSelected = (form.availabilityDays || []).includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleCheckboxChange("availabilityDays", day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                    ${
                      isSelected
                        ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                        : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 5: Available From & Available Until */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">Available From</label>
            <input
              type="time"
              name="availableFrom"
              value={form.availableFrom || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">Available Until</label>
            <input
              type="time"
              name="availableUntil"
              value={form.availableUntil || ""}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onSaveDraft}
          className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          Save Draft
        </button>
        <button
          onClick={onContinue}
          className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-[#0F1A3D] hover:opacity-95 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ProfessionalInfo;
