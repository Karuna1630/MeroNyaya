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
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .required('Full name is required'),
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .trim()
    .matches(/^[+]?[\d\s()-]{10,}$/u, 'Please enter a valid phone number')
    .required('Phone number is required'),
 dob: Yup.date()
  .max(
    new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
    'You must be at least 18 years old'
  )
  .typeError('Date of birth is required')
  .required('Date of birth is required'),
  gender: Yup.string()
    .oneOf(['Female', 'Male', 'Other'], 'Select a valid gender')
    .required('Gender is required'),
  permanentAddress: Yup.string()
    .trim()
    .min(5, 'Permanent address must be at least 5 characters')
    .required('Permanent address is required'),
  currentAddress: Yup.string()
    .trim()
    .min(5, 'Current address must be at least 5 characters')
    .required('Current address is required'),
});
