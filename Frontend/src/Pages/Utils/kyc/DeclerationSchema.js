import * as Yup from 'yup';

export const DeclarationInitialValues = {
  confirmAccuracy: false,
  authorizeVerification: false,
  agreeTerms: false,
};

export const DeclarationValidationSchema = Yup.object().shape({
  confirmAccuracy: Yup.boolean()
    .required('Please confirm accuracy of information')
    .oneOf([true], 'You must confirm the accuracy'),
  authorizeVerification: Yup.boolean()
    .required('Please authorize verification')
    .oneOf([true], 'You must authorize verification'),
  agreeTerms: Yup.boolean()
    .required('Please agree to terms and conditions')
    .oneOf([true], 'You must agree to terms and conditions'),
});
