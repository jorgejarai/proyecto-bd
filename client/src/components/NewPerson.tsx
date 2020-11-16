import React, { Dispatch, SetStateAction } from "react";
import {
  CountriesQuery,
  PersonsQuery,
  PersonsDocument,
  useAddPersonMutation,
  useAddAddressMutation,
} from "../generated/graphql";
import { Button, Col, Form, Modal } from "react-bootstrap";
import { Formik, Form as FormikForm, Field } from "formik";
import * as yup from "yup";

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  countryData: CountriesQuery;
}

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

export const NewPerson: React.FC<Props> = ({ show, setShow, countryData }) => {
  const [addAddress, { client }] = useAddAddressMutation();
  const [addPerson] = useAddPersonMutation();

  console.log(countryData);

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>New Person</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          name: "",
          rut: "",
          division: "",
          address: "",
          country: 152,
          email: "",
          phone: null,
        }}
        onSubmit={async (values, { setSubmitting }) => {
          const {
            name,
            rut,
            division,
            address,
            country,
            email,
            phone,
          } = values;
          setSubmitting(true);

          const addressResponse = await addAddress({
            variables: {
              address,
              country,
              // postalCode
            },
          });

          if (!addressResponse || !addressResponse.data) {
            console.error("General error");
            return;
          }

          const addressId = addressResponse.data.addAddress;

          if (!addressId) {
            return null;
          }

          const personResponse = await addPerson({
            variables: {
              name,
              rut,
              division,
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
            console.error("General error");
            return;
          }

          setSubmitting(false);
          setShow(false);
        }}
        validationSchema={personSchema}
      >
        {({ errors, isSubmitting, setFieldValue }) => (
          <>
            <FormikForm>
              <Modal.Body>
                <Form.Row>
                  <Form.Group as={Col} xs={8}>
                    <Field placeholder="Name" name="name" as={Form.Control} />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="RUT"
                      name="rut"
                      validate={(rut: string) => {
                        if (rut.length < 3) return "Invalid RUT";
                        else if (!rut.match(/[0-9.]+-[0-9kK]/g))
                          return "Invalid RUT";

                        const rawRut = rut.replace(".", "").replace("-", "");

                        const rutNumber = rawRut
                          .slice(0, -1)
                          .split("")
                          .reverse()
                          .join("");
                        let rutDv = rawRut.slice(-1).toUpperCase();

                        if (rutDv === "K") rutDv = "10";
                        else if (rutDv === "0") rutDv = "11";

                        console.log(rutNumber);
                        let acc = 0;
                        for (let i = 0, j = 0; i < rutNumber.length; i++, j++) {
                          acc += parseInt(rutNumber.charAt(i)) * (2 + (j % 6));
                        }

                        const expectedDv = 11 - (acc % 11);
                        const givenDv = parseInt(rutDv);

                        if (expectedDv !== givenDv) return "Invalid RUT";
                      }}
                      as={Form.Control}
                      isInvalid={!!errors.rut}
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid RUT
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="Division"
                      name="division"
                      as={Form.Control}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.division}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} xs={7}>
                    <Field
                      placeholder="Address"
                      name="address"
                      as={Form.Control}
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
                            "" + countryNumber === event.target.value
                        );

                        if (newCountry)
                          setFieldValue("country", newCountry.countryNumber);
                        else setFieldValue("country", 152);
                      }}
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
                    <Field placeholder="Email" name="email" as={Form.Control} />
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
                  disabled={isSubmitting || !!errors}
                >
                  {isSubmitting ? "Hang on..." : "Add"}
                </Button>
              </Modal.Footer>
            </FormikForm>
          </>
        )}
      </Formik>
    </Modal>
  );
};
