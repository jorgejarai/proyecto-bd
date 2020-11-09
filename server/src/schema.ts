import * as yup from 'yup';

export const userRegistrationSchema = yup.object({
  email: yup.string().email().max(254).required(),
  name: yup.string().min(5).max(64).required(),
  password: yup.string().min(3).max(64).required(),
});

export const userLoginSchema = yup.object({
  email: yup.string().email().max(254).required(),
  name: yup.string().min(5).max(64).required(),
  password: yup.string().min(3).max(64).required(),
});

export const personSchema = yup.object({
  name: yup.string().min(5).max(64).required(),
  division: yup.string().min(3).max(64),
  address: yup.number().integer(),
  // .when('email', {
  //   is: (email) => !email,
  //   then: yup.number().integer().required(),
  //   otherwise: yup.number().integer(),
  // }),
  country: yup.number().integer(),
  email: yup.string().email().max(254),
  // .when('address', {
  //   is: (address) => !address || address.length === 0,
  //   then: yup.string().email().required(),
  //   otherwise: yup.string().email(),
  // }),
  phone: yup.number().integer(),
});
