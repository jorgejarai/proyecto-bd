import * as yup from 'yup';

export const personSchema = yup.object({
  name: yup
    .string()
    .min(5, 'Name too short')
    .max(64, 'Name too long')
    .required('Please input a name'),
  division: yup
    .string()
    .min(3, 'Division too short')
    .max(64, 'Division too long')
    .nullable(),
  address: yup
    .string()
    .min(3, 'Address too short')
    .max(128, 'Address too long')
    .nullable(),
  email: yup
    .string()
    .email('Invalid email')
    .max(254, 'Emails cannot be that long')
    .nullable()
    .when('address', {
      is: (address) => !address || address.length === 0,
      then: yup
        .string()
        .email()
        .required('Must provide either a postal address or an email'),
      otherwise: yup.string().email(),
    }),
  postalCode: yup.string().max(16, 'Postal code too long').nullable(),
  phone: yup.number().integer().nullable(),
});

export const documentSchema = yup.object({
  docType: yup.number().integer().required('Must provide a document type'),
  docNumber: yup.string().max(16, 'Document number too long'),
  subject: yup.string().max(128).required('Must provide a subject'),
  writtenOn: yup
    .date()
    .max(new Date().toISOString(), 'Cannot write a message in the future'),
  sender: yup
    .number()
    .integer('Must provide a sender')
    .required('Must provide a sender')
    .min(0, 'Must provide a sender'),
  sentOn: yup.date().max(new Date(), 'Cannot send a message in the future'),
  recipients: yup.array().of(
    yup.object({
      id: yup.number().integer().required(),
      date: yup.date().max(new Date().toISOString()),
    })
  ),
});
