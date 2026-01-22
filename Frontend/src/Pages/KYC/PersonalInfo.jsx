import React from "react";
import { User2 } from "lucide-react";

const PersonalInfo = ({ form, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <User2 size={20} className="text-slate-700" />
        <h2 className="text-lg font-semibold text-[#0F1A3D]">Personal Information</h2>
      </div>

      {/* Form Grid */}
      <div className="space-y-5">
        {/* Row 1: Full Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 placeholder-slate-400"
              placeholder="Adv. Ram Kumar"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">Email Address</label>
            <input
              type="email"
              value={form.email}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 placeholder-slate-400"
              placeholder="ram.kumar@example.com"
            />
          </div>
        </div>

        {/* Row 2: Phone & Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
              placeholder="9816309711"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
          </div>
        </div>

        {/* Row 3: Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={onChange}
            className="w-full md:w-1/2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Row 4: Permanent Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Permanent Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="permanentAddress"
            value={form.permanentAddress}
            onChange={onChange}
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] resize-none"
            placeholder="Nepal"
          />
        </div>

        {/* Row 5: Current Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">
            Current Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="currentAddress"
            value={form.currentAddress}
            onChange={onChange}
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
