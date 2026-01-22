import React, { useState } from "react";
import { FileText, Upload } from "lucide-react";

const IdentityDocs = ({ form, onChange, onSaveDraft, onContinue }) => {
  const [draggedOver, setDraggedOver] = useState(null);

  const handleFileChange = (fieldName, file) => {
    if (file && file.size <= 5 * 1024 * 1024) {
      onChange({
        target: {
          name: fieldName,
          value: file,
        },
      });
    } else {
      alert("File size must be less than 5MB");
    }
  };

  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    setDraggedOver(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(fieldName, file);
    }
  };

  const handleDragOver = (e, fieldName) => {
    e.preventDefault();
    setDraggedOver(fieldName);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const renderUploadBox = (fieldName, label, isRequired = true) => {
    const file = form[fieldName];
    const isDragged = draggedOver === fieldName;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800">
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <div
          onDrop={(e) => handleDrop(e, fieldName)}
          onDragOver={(e) => handleDragOver(e, fieldName)}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer hover:border-slate-400
            ${isDragged ? "border-[#0F1A3D] bg-slate-50" : "border-slate-300 bg-white"}
            ${file ? "border-green-500 bg-green-50" : ""}`}
        >
          <input
            type="file"
            id={fieldName}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(fieldName, e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
            <Upload size={32} className={file ? "text-green-600" : "text-slate-400"} />
            {file ? (
              <>
                <p className="text-sm font-medium text-green-700">{file.name}</p>
                <p className="text-xs text-green-600">File uploaded successfully</p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <FileText size={20} className="text-slate-700" />
        <h2 className="text-lg font-semibold text-[#0F1A3D]">Identity Documents Upload</h2>
      </div>

      {/* Required Documents */}
      <div className="space-y-5">
        {/* Row 1: Citizenship Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderUploadBox("citizenshipFront", "Citizenship Card (Front)")}
          {renderUploadBox("citizenshipBack", "Citizenship Card (Back)")}
        </div>

        {/* Row 2: License & Passport Photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderUploadBox("lawyerLicense", "Lawyer License Certificate (Nepal Bar Council)")}
          {renderUploadBox("passportPhoto", "Recent Passport Size Photo")}
        </div>
      </div>

      {/* Optional Documents Section */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Optional Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderUploadBox("lawDegree", "Law Degree Certificate", false)}
          {renderUploadBox("experienceCertificate", "Experience Certificate", false)}
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

export default IdentityDocs;
