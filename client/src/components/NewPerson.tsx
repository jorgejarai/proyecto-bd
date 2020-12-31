import React, { Dispatch, SetStateAction } from 'react';
import {
  CountriesQuery,
  PersonsQuery,
  PersonsDocument,
  useAddPersonMutation,
  useAddAddressMutation,
} from '../generated/graphql';
import { Button, Col, Form, Modal } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field } from 'formik';
import { personSchema } from '../schemas';
import { validateRut } from '../rutUtils';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  countryData: CountriesQuery;
}

interface FormInitialValues {
  name: string;
  rut: string | null;
  division: string | null;
  address: string;
  country: number;
  email: string | null;
  phone: string | null;
  postalCode: string | null;
}

export const NewPerson: React.FC<Props> = ({ show, setShow, countryData }) => {
  const [addAddress, { client }] = useAddAddressMutation();
  const [addPerson] = useAddPersonMutation();

  const initialValues: FormInitialValues = {
    name: '',
    rut: '',
    division: '',
    address: '',
    country: 152,
    email: '',
    phone: '',
    postalCode: '',
  };

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>New Person</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting }) => {
          const {
            name,
            rut,
            division,
            address,
            country,
            email,
            phone,
            postalCode,
          } = values;
          setSubmitting(true);

          const addressResponse = await addAddress({
            variables: {
              address,
              country,
              postalCode,
            },
          });

          if (!addressResponse || !addressResponse.data) {
            console.error('General error');
            return;
          }

          const addressId = addressResponse.data.addAddress.address?.id;

          if (!addressId) {
            return null;
          }

          const personResponse = await addPerson({
            variables: {
              name,
              rut: rut && rut !== '' ? parseInt(rut.slice(0, -2)) : null,
              division: division !== '' ? division : null,
              email,
              phone,
              address: addressId,
            },
            update: (cache, { data }) => {
              if (!data) return null;

              const persons: any = cache.readQuery({
                query: PersonsDocument,
              });
              const newPerson = data.addPerson;

              cache.writeQuery<PersonsQuery>({
                query: PersonsDocument,
                data: {
                  persons: [...persons.persons, newPerson],
                },
              });

              client.resetStore();
            },
          });

          if (!personResponse || !personResponse.data) {
            console.error('General error');
            return;
          }

          setSubmitting(false);
          setShow(false);
        }}
        validationSchema={personSchema}
      >
        {({ errors, isSubmitting, isValid, setFieldValue }) => (
          <>
            {console.log(errors)}
            <FormikForm>
              <Modal.Body>
                <Form.Row>
                  <Form.Group as={Col} xs={8}>
                    <Field
                      placeholder="Name"
                      name="name"
                      as={Form.Control}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="RUT"
                      name="rut"
                      as={Form.Control}
                      validate={validateRut}
                      isInvalid={!!errors.rut}
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid RUT
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} xs={9}>
                    <Field
                      placeholder="Division"
                      name="division"
                      as={Form.Control}
                      isInvalid={!!errors.division}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.division}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} xs={3}>
                    <Field
                      placeholder="Postal code"
                      name="postalCode"
                      as={Form.Control}
                      isInvalid={!!errors.postalCode}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.postalCode}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} xs={7}>
                    <Field
                      placeholder="Address"
                      name="address"
                      as={Form.Control}
                      isInvalid={!!errors.address}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.address}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Control
                      as="select"
                      name="country"
                      onChange={(event) => {
                        const newCountry = countryData.countries.find(
                          ({ countryNumber }) =>
                            '' + countryNumber === event.target.value
                        );

                        if (newCountry)
                          setFieldValue('country', newCountry.countryNumber);
                        else setFieldValue('country', 152);
                      }}
                      isInvalid={!!errors.country}
                    >
                      {countryData.countries.map((country) => (
                        <option
                          key={country.countryNumber}
                          value={country.countryNumber}
                          selected={country.countryNumber === 152}
                        >
                          {country.name}
                        </option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.country}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} xs={8}>
                    <Field
                      placeholder="Email"
                      name="email"
                      as={Form.Control}
                      isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="Phone"
                      name="phone"
                      as={Form.Control}
                      type="tel"
                      isInvalid={!!errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? 'Hang on...' : 'Add'}
                </Button>
              </Modal.Footer>
            </FormikForm>
          </>
        )}
      </Formik>
    </Modal>
  );
};
