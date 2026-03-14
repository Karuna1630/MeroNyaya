import * as Yup from "yup";

export const resetPasswordSchema = Yup.object({
  new_password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password")], "Passwords do not match")
    .required("Confirm password is required"),
});
