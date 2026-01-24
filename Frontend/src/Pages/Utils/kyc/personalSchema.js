import * as Yup from 'yup';

export const PersonalInitialValues = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  gender: 'Female',
  permanentAddress: '',
  currentAddress: '',
};

export const PersonalValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[+]?[\d\s()-]{10,}$/u, 'Please enter a valid phone number'),
  dob: Yup.date()
    .required('Date of birth is required')
    .typeError('Date of birth must be a valid date')
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      'You must be at least 18 years old'
    ),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['Female', 'Male', 'Other'], 'Select a valid gender'),
  permanentAddress: Yup.string()
    .required('Permanent address is required')
    .min(5, 'Permanent address must be at least 5 characters'),
  currentAddress: Yup.string()
    .required('Current address is required')
    .min(5, 'Current address must be at least 5 characters'),
});
