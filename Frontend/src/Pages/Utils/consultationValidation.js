import * as Yup from "yup";

export const consultationValidationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Consultation title is required")
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must not exceed 255 characters"),
  meetingLocation: Yup.string()
    .trim()
    .required("Meeting location is required")
    .min(3, "Meeting location must be at least 3 characters")
    .max(255, "Meeting location must not exceed 255 characters"),
  phoneNumber: Yup.string()
    .trim()
    .required("Phone number is required")
    .matches(
      /^[0-9+\-\s()]{7,20}$/,
      "Phone number must be 7-20 digits (can include +, -, spaces, parentheses)"
    ),
});
