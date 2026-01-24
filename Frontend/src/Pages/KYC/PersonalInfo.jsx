import React from "react";
import { User2 } from "lucide-react";
import { Field, ErrorMessage } from "formik";

const PersonalInfo = ({ formik }) => {
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
            <label className="block text-sm font-semibold text-slate-800">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Field
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="fullName"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Field
              name="email"
              type="email"
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="email"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
        </div>

        {/* Row 2: Phone & Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Field
              name="phone"
              type="tel"
              placeholder="9816309711"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="phone"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <Field
              name="dob"
              type="date"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
            />
            <ErrorMessage
              name="dob"
              component="p"
              className="text-red-500 text-xs mt-1"
            />
          </div>
        </div>

        {/* Row 3: Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Gender <span className="text-red-500">*</span>
          </label>
          <Field
            name="gender"
            as="select"
            className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
          >
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </Field>
          <ErrorMessage
            name="gender"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>

        {/* Row 4: Permanent Address */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Permanent Address <span className="text-red-500">*</span>
          </label>
          <Field
            name="permanentAddress"
            as="textarea"
            rows={3}
            placeholder="Enter your permanent address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] resize-none"
          />
          <ErrorMessage
            name="permanentAddress"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>

        {/* Row 5: Current Address */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Current Address <span className="text-red-500">*</span>
          </label>
          <Field
            name="currentAddress"
            as="textarea"
            rows={3}
            placeholder="Enter your current address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] resize-none"
          />
          <ErrorMessage
            name="currentAddress"
            component="p"
            className="text-red-500 text-xs mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
