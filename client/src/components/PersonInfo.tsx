import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  useCountriesQuery,
  usePersonQuery,
  PersonsDocument,
  PersonsQuery,
  useUpdatePersonMutation,
  useUpdatePersonAndAddressMutation,
  useDeletePersonMutation,
  PersonDocument,
  PersonQuery,
  PersonOutput,
  useMeQuery,
} from '../generated/graphql';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field } from 'formik';
import loadingImage from '../assets/loading.svg';
import { personSchema } from '../schemas';
import { validateRut } from '../rutUtils';
import { DeletePerson } from './DeletePerson';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  perId: number;
}

interface FormInitialValues {
  name: string;
  rut: string | null | undefined;
  division: string | null | undefined;
  address: string;
  country: number;
  email: string | null | undefined;
  phone: string | null | undefined;
  postalCode: string | null | undefined;
}

export const PersonInfo: React.FC<Props> = ({ show, setShow, perId }) => {
  const {
    data: couData,
    loading: couLoading,
    error: couError,
  } = useCountriesQuery();
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useMeQuery();
  const {
    data: perData,
    loading: perLoading,
    error: perError,
  } = usePersonQuery({
    variables: {
      id: perId,
    },
  });
  const [updatePerson, { client }] = useUpdatePersonMutation();
  const [updatePersonAndAddress] = useUpdatePersonAndAddressMutation();
  const [deletePerson] = useDeletePersonMutation();

  const [showDelete, setShowDelete] = useState(false);

  if (couLoading || perLoading || meLoading) {
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>Person Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col className="d-flex justify-content-center mt-5 mb-5">
              <img alt="Loading..." src={loadingImage} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShow(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  if (
    couError ||
    !couData ||
    !couData.countries ||
    perError ||
    !perData ||
    !perData.person ||
    !perData.person.person ||
    !perData.person.person.address ||
    meError ||
    !meData ||
    !meData.me
  ) {
    console.log(couError, perError, perData);
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>Person Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          There was a problem while processing your petition.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShow(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const initialAddress = {
    address: perData.person.person.address.address,
    country: perData.person.person.address.country.countryNumber,
    postalCode: perData.person.person.address.postalCode,
  };

  const initialValues: FormInitialValues = {
    name: perData.person.person.name,
    rut: perData.person.person.rut,
    division: perData.person.person.division,
    address: perData.person.person.address.address,
    country: perData.person.person.address.country.countryNumber,
    email: perData.person.person.email,
    phone: perData.person.person.phone,
    postalCode: perData.person.person.address.postalCode,
  };

  return (
    <>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Person Info</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={initialValues}
          onSubmit={async (values, { setSubmitting }) => {
            if (!meData.me.user!.isClerk) {
              setShow(false);
              return
            }

            const {
              name,
              rut,
              division,
              address,
              country,
              postalCode,
              email,
              phone,
            } = values;
            setSubmitting(true);

            if (
              address !== initialAddress.address ||
              country !== initialAddress.country ||
              postalCode !== initialAddress.postalCode
            ) {
              const addressResponse = await updatePersonAndAddress({
                variables: {
                  person: perId,
                  data: {
                    name,
                    rutNum: rut ? parseInt(rut?.slice(0, -2)) : null,
                    division,
                    email,
                    phone,
                  },
                  address,
                  country,
                  postalCode,
                },
                update: (cache, { data }) => {
                  if (!data || !data.updatePersonAndAddress) {
                    return null;
                  }

                  const cachedPersons: any = cache.readQuery({
                    query: PersonsDocument,
                  });
                  const personsList = cachedPersons.persons.persons.map(
                    (per: PersonOutput) => {
                      if (per.id !== perId) {
                        return per;
                      }

                      const newPerson = {
                        ...per,
                        person: data.updatePersonAndAddress?.person,
                      };

                      return newPerson;
                    }
                  );

                  const cachedPerson: any = cache.readQuery({
                    query: PersonDocument,
                    variables: { id: perId },
                  })!;

                  cache.writeQuery<PersonQuery>({
                    query: PersonDocument,
                    data: {
                      person: {
                        ...cachedPerson,
                        person: data.updatePersonAndAddress.person,
                      },
                    },
                    variables: { id: perId },
                  });

                  cache.writeQuery<PersonsQuery>({
                    query: PersonsDocument,
                    data: {
                      persons: personsList,
                    },
                  });
                },
              });

              if (!addressResponse || !addressResponse.data) {
                console.error('General error');
              }
            } else {
              const personResponse = await updatePerson({
                variables: {
                  perId: perId,
                  data: {
                    name,
                    rutNum: rut ? parseInt(rut?.slice(0, -2)) : null,
                    division,
                    email,
                    phone,
                  },
                },
                update: (cache, { data }) => {
                  if (
                    !data ||
                    !data.updatePerson ||
                    data.updatePerson.status.status === 'error'
                  ) {
                    return null;
                  }

                  const cachedPersons: any = cache.readQuery({
                    query: PersonsDocument,
                  });
                  let personsList = cachedPersons.persons.persons.map(
                    (per: PersonOutput) => {
                      if (per.id !== perId) {
                        return per;
                      }

                      return {
                        ...per,
                        ...data.updatePerson,
                      };
                    }
                  );

                  const cachedPerson: any = cache.readQuery({
                    query: PersonDocument,
                    variables: { id: perId },
                  })!;

                  cache.writeQuery<PersonQuery>({
                    query: PersonDocument,
                    data: {
                      person: {
                        ...cachedPerson,
                        person: data.updatePerson.person,
                      },
                    },
                    variables: { id: perId },
                  });

                  cache.writeQuery<PersonsQuery>({
                    query: PersonsDocument,
                    data: {
                      persons: personsList,
                    },
                  });
                },
              });

              if (!personResponse || !personResponse.data) {
                console.error('General error');
              }
            }
            client.resetStore();

            setSubmitting(false);
            setShow(false);
          }}
          validationSchema={personSchema}
        >
          {({ isValid, errors, isSubmitting, setFieldValue }) => (
            <>
              <FormikForm>
                <Modal.Body>
                  <Form.Row>
                    <Form.Group as={Col} xs={4}>
                      <Form.Label column>{`Person No. ${
                        perData!.person!.person!.id
                      }`}</Form.Label>
                    </Form.Group>
                    <Form.Group as={Col} xs={{ span: 4, offset: 4 }}>
                      <Field
                        placeholder="RUT"
                        name="rut"
                        readonly={!meData.me.user!.isClerk}
                        as={Form.Control}
                        validate={validateRut}
                        isInvalid={!!errors.rut}
                      />
                      <Form.Control.Feedback type="invalid" id="rut">
                        {errors.rut}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Field
                        placeholder="Name"
                        name="name"
                        readonly={!meData.me.user!.isClerk}
                        as={Form.Control}
                        isInvalid={!!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col} xs={9}>
                      <Field
                        placeholder="Division"
                        name="division"
                        readonly={!meData.me.user!.isClerk}
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
                        readonly={!meData.me.user!.isClerk}
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
                        readonly={!meData.me.user!.isClerk}
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
                        disabled={!meData.me.user!!.isClerk}
                        onChange={(event) => {
                          const newCountry = couData.countries.countries.find(
                            ({ countryNumber }) =>
                              '' + countryNumber === event.target.value
                          );

                          if (newCountry)
                            setFieldValue('country', newCountry.countryNumber);
                          else
                            setFieldValue(
                              'country',
                              perData.person?.person?.address?.country
                                .countryNumber
                            );
                        }}
                        isInvalid={!!errors.country}
                      >
                        {couData.countries.countries.map((country) => (
                          <option
                            key={country.countryNumber}
                            value={country.countryNumber}
                            selected={
                              country.countryNumber ===
                              perData.person?.person?.address?.country
                                .countryNumber
                            }
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
                        readonly={!meData.me.user!.isClerk}
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
                        readonly={!meData.me.user!.isClerk}
                        as={Form.Control}
                        type="tel"
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
                  {meData.me.user!.isClerk && <Button
                    variant="danger"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShow(false);
                      setShowDelete(true);
                    }}
                  >
                    {isSubmitting ? 'Hang on...' : 'Delete'}
                  </Button>}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? 'Hang on...' : 'OK'}
                  </Button>
                </Modal.Footer>
              </FormikForm>
            </>
          )}
        </Formik>
      </Modal>
      <DeletePerson
        show={showDelete}
        onSuccessfulClose={async () => {
          const deleteResponse = await deletePerson({
            variables: { id: perId },
            update: (cache, { data }) => {
              if (!data || !data.deletePerson) {
                return null;
              }

              const cachedPersons: any = cache.readQuery({
                query: PersonsDocument,
              });
              const modifiedPersons = cachedPersons.persons.persons.filter(
                (per: any) => per.id !== perId
              );

              cache.writeQuery<PersonsQuery>({
                query: PersonsDocument,
                data: {
                  persons: modifiedPersons,
                },
              });

              cache.writeQuery<PersonQuery>({
                query: PersonDocument,
                data: {
                  person: {
                    status: {
                      status: 'error',
                      message: 'Person not found',
                    },
                  },
                },
                variables: { id: perId },
              });

              client.resetStore();
            },
          });

          if (!deleteResponse || !deleteResponse.data) {
            console.error('General error');
          }

          setShowDelete(false);
          setShow(false);
        }}
        onFailedClose={() => {
          setShowDelete(false);
          setShow(true);
        }}
      />
    </>
  );
};
