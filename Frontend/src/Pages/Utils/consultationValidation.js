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

export const getAcceptConsultationSchema = (mode, options = {}) => {
  const { requireSchedule = false } = options;

  const schemaShape = {
    meeting_link:
      mode === "video"
        ? Yup.string()
            .transform((value) => (value === "" ? undefined : value))
            .url("Must be a valid URL")
            .required("Meeting link is required for video consultations")
        : Yup.string().notRequired(),
    meeting_location:
      mode === "in_person"
        ? Yup.string().trim().required("Meeting location is required")
        : Yup.string().notRequired(),
    phone_number:
      mode === "in_person"
        ? Yup.string()
            .trim()
            .required("Phone number is required")
            .matches(
              /^[0-9+\-\s()]{7,20}$/,
              "Phone number must be 7-20 digits (can include +, -, spaces, parentheses)"
            )
        : Yup.string().notRequired(),
  };

  if (requireSchedule) {
    schemaShape.scheduled_date = Yup.string().required("Date is required");
    schemaShape.scheduled_time = Yup.string().required("Time is required");
  }

  return Yup.object().shape(schemaShape);
};

export const acceptConsultationSchema = getAcceptConsultationSchema();
