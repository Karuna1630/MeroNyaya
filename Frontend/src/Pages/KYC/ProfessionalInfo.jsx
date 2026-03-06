import React from "react";
import { Briefcase } from "lucide-react";
import { Field, ErrorMessage, useFormikContext } from "formik";
import { LAW_CATEGORIES } from "../../utils/lawCategories";

const specializations = LAW_CATEGORIES;

// Days of the week for availability selection
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ProfessionalInfo component for the KYC process, allowing lawyers to input their professional details such as bar council registration, law firm name, experience, specialization, and availability
const ProfessionalInfo = () => {
  const { values, setFieldValue } = useFormikContext();

  // Handle checkbox changes for multi-select fields (specializations and availability days)
  const handleCheckboxChange = (field, value) => {
    const currentValues = values[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setFieldValue(field, newValues);
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
            <label className="block text-sm font-semibold text-slate-800">
              Nepal Bar Council Registration Number <span className="text-red-500">*</span>
            </label>
            <Field
              name="barCouncilNumber"
              type="text"
              placeholder="e.g., NPC-XXXXX"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="barCouncilNumber"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">Law Firm Name (Optional)</label>
            <Field
              name="lawFirmName"
              type="text"
              placeholder="Enter law firm name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="lawFirmName"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
        </div>

        {/* Row 2: Years of Experience & Consultation Fee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <Field
              name="yearsOfExperience"
              as="select"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            >
              <option value="">Select experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </Field>
            <ErrorMessage
              name="yearsOfExperience"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Consultation Fee (NPR) <span className="text-red-500">*</span>
            </label>
            <Field
              name="consultationFee"
              type="number"
              placeholder="e.g., 2000"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="consultationFee"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
        </div>

        {/* Row 3: Area of Specialization */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Area of Specialization <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => {
              const isSelected = (values.specializations || []).includes(spec);
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
          <ErrorMessage
            name="specializations"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>

        {/* Row 4: Availability Days */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Availability Days <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => {
              const isSelected = (values.availabilityDays || []).includes(day);
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
          <ErrorMessage
            name="availabilityDays"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>

        {/* Row 5: Available From & Available Until */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">Available From</label>
            <Field
              name="availableFrom"
              type="time"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="availableFrom"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">Available Until</label>
            <Field
              name="availableUntil"
              type="time"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="availableUntil"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
        </div>

        {/* Row 6: Payment Wallet Numbers */}
        <div className="mt-2 p-4 bg-gradient-to-r from-green-50 to-purple-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            <h3 className="text-sm font-bold text-slate-800">Payment Wallet Numbers</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Enter at least one wallet number to receive payouts from the platform. <span className="text-red-500 font-semibold">*</span></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                eSewa Number <span className="text-red-500">*</span>
              </label>
              <Field
                name="esewaNumber"
                type="text"
                placeholder="e.g., 98XXXXXXXX"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-slate-400">Your eSewa registered mobile number</p>
              <ErrorMessage
                name="esewaNumber"
                component="p"
                className="text-red-500 text-xs mt-1"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                Khalti Number <span className="text-red-500">*</span>
              </label>
              <Field
                name="khaltiNumber"
                type="text"
                placeholder="e.g., 98XXXXXXXX"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-400">Your Khalti registered mobile number</p>
              <ErrorMessage
                name="khaltiNumber"
                component="p"
                className="text-red-500 text-xs mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInfo;
