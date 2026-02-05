import * as Yup from "yup";

export const getConsultationValidationSchema = (mode) => {
  return Yup.object().shape({
    title: Yup.string()
      .trim()
      .required("Consultation title is required")
      .min(5, "Title must be at least 5 characters")
      .max(255, "Title must not exceed 255 characters"),
    meetingLocation: mode === "in_person"
      ? Yup.string()
          .trim()
          .required("Meeting location is required")
          .min(3, "Meeting location must be at least 3 characters")
          .max(255, "Meeting location must not exceed 255 characters")
      : Yup.string().notRequired(),
    phoneNumber: mode === "in_person"
      ? Yup.string()
          .trim()
          .required("Phone number is required")
          .matches(
            /^[0-9+\-\s()]{7,20}$/,
            "Phone number must be 7-20 digits (can include +, -, spaces, parentheses)"
          )
      : Yup.string().notRequired(),
  });
};

export const consultationValidationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Consultation title is required")
    .min(5, "Title must be at least 5 characters")
    .max(255, "Title must not exceed 255 characters"),
  meetingLocation: Yup.string()
    .trim()
    .when('$mode', {
      is: 'in_person',
      then: (schema) => schema
        .required("Meeting location is required")
        .min(3, "Meeting location must be at least 3 characters")
        .max(255, "Meeting location must not exceed 255 characters"),
      otherwise: (schema) => schema.notRequired()
    }),
  phoneNumber: Yup.string()
    .trim()
    .when('$mode', {
      is: 'in_person',
      then: (schema) => schema
        .required("Phone number is required")
        .matches(
          /^[0-9+\-\s()]{7,20}$/,
          "Phone number must be 7-20 digits (can include +, -, spaces, parentheses)"
        ),
      otherwise: (schema) => schema.notRequired()
    }),
});

export const acceptConsultationSchema = Yup.object().shape({
  scheduled_date: Yup.date()
    .required("Date is required")
    .min(new Date().toISOString().split('T')[0], "Date cannot be in the past"),
  scheduled_time: Yup.string()
    .required("Time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  meeting_link: Yup.string()
    .url("Must be a valid URL")
    .when('$mode', {
      is: 'video',
      then: (schema) => schema.required("Meeting link is required for video consultations"),
      otherwise: (schema) => schema.notRequired()
    })
});
