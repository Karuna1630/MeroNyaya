import * as Yup from "yup";

export const lawercaseappointmentverification = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Appointment title is required")
    .max(200, "Title must not exceed 200 characters"),
  mode: Yup.string()
    .oneOf(["video", "in_person"], "Invalid meeting mode")
    .required("Meeting mode is required"),
  scheduled_date: Yup.string().required("Date is required"),
  scheduled_time: Yup.string().required("Time is required"),
  meeting_link: Yup.string()
    .transform((value) => (value === "" ? undefined : value))
    .url("Please enter a valid meeting link")
    .when("mode", {
      is: "video",
      then: (schema) => schema.required("Meeting link is required for video appointments"),
      otherwise: (schema) => schema.notRequired(),
    }),
  meeting_location: Yup.string().when("mode", {
    is: "in_person",
    then: (schema) => schema.trim().required("Meeting location is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  phone_number: Yup.string().when("mode", {
    is: "in_person",
    then: (schema) =>
      schema
        .trim()
        .required("Phone number is required")
        .matches(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
