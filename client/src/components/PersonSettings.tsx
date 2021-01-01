import React, { Dispatch, SetStateAction } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field } from 'formik';
import { usePersonNamesQuery } from '../generated/graphql';
import { Typeahead } from 'react-bootstrap-typeahead';
import loadingImage from '../assets/loading.svg';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  recipient: number;
  setRecipient: Dispatch<SetStateAction<number>>;
}

export const PersonSettings: React.FC<Props> = ({
  show,
  setShow,
  recipient,
  setRecipient,
}) => {
  const { data, loading, error } = usePersonNamesQuery();

  if (loading) {
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>Settings</Modal.Title>
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

  if (error || !data || !data.personNames) {
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>There was a problem loading the data.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShow(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const initialPerson = data.personNames.personNames.find(
    (person) => person.id === recipient
  );
  const initialPersonLabel = initialPerson ? initialPerson.label : '';

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
                      options={data.personNames}
                      onChange={(selected: any[]) => {
                        const sender = selected[0] ? selected[0].id : null;
                        setFieldValue('recipient', sender);
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
                  {isSubmitting ? 'Hang on...' : 'OK'}
                </Button>
              </Modal.Footer>
            </FormikForm>
          </>
        )}
      </Formik>
    </Modal>
  );
};
