import * as Yup from 'yup';

export const ProfessionalInitialValues = {
  barCouncilNumber: '',
  lawFirmName: '',
  yearsOfExperience: '',
  consultationFee: '',
  specializations: [],
  availabilityDays: [],
  availableFrom: '',
  availableUntil: '',
  esewaNumber: '',
  khaltiNumber: '',
};

export const ProfessionalValidationSchema = Yup.object().shape({
  barCouncilNumber: Yup.string()
    .required('Bar Council number is required')
    .min(5, 'Bar Council number must be at least 5 characters'),
  lawFirmName: Yup.string()
    .nullable()
    .optional(),
  yearsOfExperience: Yup.string()
    .required('Years of experience is required'),
  consultationFee: Yup.number()
    .required('Consultation fee is required')
    .positive('Consultation fee must be greater than 0')
    .typeError('Consultation fee must be a valid number'),
  specializations: Yup.array()
    .min(1, 'Select at least one specialization'),
  availabilityDays: Yup.array()
    .min(1, 'Select at least one availability day'),
  availableFrom: Yup.string()
    .required('Available from time is required'),
  availableUntil: Yup.string()
    .required('Available until time is required'),
  esewaNumber: Yup.string()
    .nullable()
    .matches(/^(98|97)\d{8}$/, 'Enter a valid 10-digit Nepali mobile number')
    .test(
      'at-least-one-wallet',
      'At least one wallet number (eSewa or Khalti) is required',
      function (value) {
        return !!value || !!this.parent.khaltiNumber;
      }
    ),
  khaltiNumber: Yup.string()
    .nullable()
    .matches(/^(98|97)\d{8}$/, 'Enter a valid 10-digit Nepali mobile number')
    .test(
      'at-least-one-wallet',
      'At least one wallet number (eSewa or Khalti) is required',
      function (value) {
        return !!value || !!this.parent.esewaNumber;
      }
    ),
});
