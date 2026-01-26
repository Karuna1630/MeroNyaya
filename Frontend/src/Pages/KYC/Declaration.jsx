import React from "react";
import { useFormikContext } from "formik";
import { CheckCircle2 } from "lucide-react";

const Declaration = () => {
  const { values, setFieldValue } = useFormikContext();

  const handleCheckboxChange = (fieldName) => {
    setFieldValue(fieldName, !values[fieldName]);
  };

  // Check if all required checkboxes are checked
  const allChecked = values.confirmAccuracy && values.authorizeVerification && values.agreeTerms;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <CheckCircle2 size={20} className="text-slate-700" />
        <h2 className="text-lg font-semibold text-[#0F1A3D]">Declaration & Consent</h2>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4 bg-slate-50 p-6 rounded-lg">
        {/* Checkbox 1 */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => handleCheckboxChange("confirmAccuracy")}
            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${
                values.confirmAccuracy
                  ? "bg-[#0F1A3D] border-[#0F1A3D]"
                  : "bg-white border-slate-300"
              }`}
          >
            {values.confirmAccuracy && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
          <label className="text-sm text-slate-800 cursor-pointer" onClick={() => handleCheckboxChange("confirmAccuracy")}>
            I confirm that all the information provided above is accurate and true to the best of my knowledge.
          </label>
        </div>

        {/* Checkbox 2 */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => handleCheckboxChange("authorizeVerification")}
            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${
                values.authorizeVerification
                  ? "bg-[#0F1A3D] border-[#0F1A3D]"
                  : "bg-white border-slate-300"
              }`}
          >
            {values.authorizeVerification && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
          <label className="text-sm text-slate-800 cursor-pointer" onClick={() => handleCheckboxChange("authorizeVerification")}>
            I authorize MeroNyaya to verify my credentials with the Nepal Bar Council and other relevant authorities.
          </label>
        </div>

        {/* Checkbox 3 */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => handleCheckboxChange("agreeTerms")}
            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${
                values.agreeTerms
                  ? "bg-[#0F1A3D] border-[#0F1A3D]"
                  : "bg-white border-slate-300"
              }`}
          >
            {values.agreeTerms && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
          <label className="text-sm text-slate-800 cursor-pointer" onClick={() => handleCheckboxChange("agreeTerms")}>
            I agree to the{" "}
            <a href="#" className="text-[#0F1A3D] underline font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#0F1A3D] underline font-medium">
              Privacy Policy
            </a>{" "}
            of MeroNyaya.
          </label>
        </div>
      </div>

      {/* Note Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Note:</span> Your KYC application will be reviewed within 2-3 business days. You will receive a notification once your verification is complete. During the review period, you will have limited access to the platform.
        </p>
      </div>
    </div>
  );
};

export default Declaration;
