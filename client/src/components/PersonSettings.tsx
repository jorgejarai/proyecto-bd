import React, { Dispatch, SetStateAction } from "react";
import { Button, Col, Form, Modal } from "react-bootstrap";
import { Formik, Form as FormikForm, Field } from "formik";
import { PersonsQuery } from "../generated/graphql";
import { Typeahead } from "react-bootstrap-typeahead";

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  perData: PersonsQuery;
  recipient: number;
  setRecipient: Dispatch<SetStateAction<number>>;
}

export const PersonSettings: React.FC<Props> = ({
  show,
  setShow,
  perData,
  recipient,
  setRecipient,
}) => {
  let personsList: any[] = [];

  perData.persons.forEach(({ person, address }) => {
    if (!person || !address) {
      return;
    }

    if (person.division)
      personsList = [
        ...personsList,
        {
          id: person.id,
          label: `${person.name} - ${person.division}`,
        },
      ];
    else personsList = [...personsList, { id: person.id, label: person.name }];
  });

  const initialPerson = personsList.find((person) => person.id === recipient);
  const initialPersonLabel = initialPerson ? initialPerson.label : "";

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          recipient,
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);

          setRecipient(values.recipient);

          setSubmitting(false);
          setShow(false);
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <>
            <FormikForm>
              <Modal.Body>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.Label>Look at mail received by...</Form.Label>
                    <Field
                      id="set-recipient"
                      name="recipient"
                      defaultInputValue={initialPersonLabel}
                      as={Typeahead}
                      options={personsList}
                      onChange={(selected: any[]) => {
                        const sender = selected[0] ? selected[0].id : null;
                        setFieldValue("recipient", sender);
                      }}
                    />
                  </Form.Group>
                </Form.Row>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShow(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button variant="primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Hang on..." : "OK"}
                </Button>
              </Modal.Footer>
            </FormikForm>
          </>
        )}
      </Formik>
    </Modal>
  );
};
