import * as Yup from 'yup';

export const IdentityInitialValues = {
  citizenshipFront: null,
  citizenshipBack: null,
  lawyerLicense: null,
  passportPhoto: null,
  lawDegree: null,
  experienceCertificate: null,
};

export const IdentityValidationSchema = Yup.object().shape({
  citizenshipFront: Yup.mixed()
    .required('Citizenship front image is required'),
  citizenshipBack: Yup.mixed()
    .required('Citizenship back image is required'),
  lawyerLicense: Yup.mixed()
    .required('Lawyer license is required'),
  passportPhoto: Yup.mixed()
    .required('Passport photo is required'),
  lawDegree: Yup.mixed()
    .required('Law degree certificate is required'),
  experienceCertificate: Yup.mixed()
    .required('Experience certificate is required'),
});
