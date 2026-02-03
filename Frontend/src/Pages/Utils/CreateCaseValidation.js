import * as Yup from 'yup';

export const CreateCaseInitialValues = {
  caseTitle: '',
  caseCategory: '',
  caseDescription: '',
  opposingParty: '',
  urgencyLevel: 'Medium',
  lawyerSelection: 'public',
  selectedLawyerIds: [],
  requestConsultation: false,
  privacyConfirmed: false,
};

export const CreateCaseValidationSchema = Yup.object().shape({
  caseTitle: Yup.string()
    .required('Case title is required')
    .min(10, 'Case title must be at least 10 characters')
    .max(200, 'Case title must not exceed 200 characters'),
  
  caseCategory: Yup.string()
    .required('Case category is required'),
  
  caseDescription: Yup.string()
    .required('Case description is required')
    .min(50, 'Please provide at least 50 characters to describe your case')
    .max(2000, 'Case description must not exceed 2000 characters'),
  
  opposingParty: Yup.string()
    .max(200, 'Opposing party name must not exceed 200 characters'),
  
  urgencyLevel: Yup.string()
    .oneOf(['Low', 'Medium', 'High'], 'Invalid urgency level')
    .required('Urgency level is required'),
  
  lawyerSelection: Yup.string()
    .oneOf(['specific', 'public'], 'Invalid lawyer selection option')
    .required('Lawyer selection is required'),

  selectedLawyerIds: Yup.array().when('lawyerSelection', {
    is: 'specific',
    then: (schema) => schema.min(1, 'Please select at least one lawyer').max(3, 'You can select up to 3 lawyers'),
    otherwise: (schema) => schema.notRequired(),
  }),
  
  requestConsultation: Yup.boolean(),
  
  privacyConfirmed: Yup.boolean()
    .oneOf([true], 'You must confirm that the information is accurate')
    .required('Privacy confirmation is required'),
});
