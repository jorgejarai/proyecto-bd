import React, { Dispatch, SetStateAction, useRef } from 'react';
import {
  DocumentsQuery,
  DocumentsDocument,
  useAddDocumentMutation,
  useDocumentTypesQuery,
  usePersonNamesQuery,
} from '../generated/graphql';
import { Button, Col, Form, Modal, Row, Table, Alert } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field } from 'formik';
import DatePicker from 'react-datepicker';
import { Typeahead } from 'react-bootstrap-typeahead';
import loadingImage from '../assets/loading.svg';
import { documentSchema } from '../schemas';
import classNames from 'classnames';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}

interface FormInitialValues {
  docType: number;
  docNumber: string;
  subject: string;
  hasWritingDate: boolean;
  writtenOn: Date;
  sender: number;
  hasSendingDate: boolean;
  sentOn: Date;
  recipients: { id: number; date: Date }[];
  hasFiles: boolean;
  files: never[];
  newRecipient: number | null | undefined;
  newRecipientDate: Date;
}

export const NewDocument: React.FC<Props> = ({ show, setShow }) => {
  const {
    data: docTypesData,
    loading: docTypesLoading,
    error: docTypesError,
  } = useDocumentTypesQuery();
  const {
    data: perData,
    loading: perLoading,
    error: perError,
  } = usePersonNamesQuery();

  const [addDocument, { client }] = useAddDocumentMutation();

  const refQla: any = useRef();

  if (docTypesLoading || perLoading) {
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>New Document</Modal.Title>
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
    docTypesError ||
    !docTypesData ||
    !docTypesData.documentTypes ||
    perError ||
    !perData ||
    !perData.personNames
  ) {
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>New Document</Modal.Title>
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

  const initialValues: FormInitialValues = {
    docType: 7,
    docNumber: '',
    subject: '',
    hasWritingDate: false,
    writtenOn: new Date(),
    sender: 0,
    hasSendingDate: false,
    sentOn: new Date(),
    recipients: [],
    hasFiles: false,
    files: [],
    newRecipient: null,
    newRecipientDate: new Date(),
  };

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>New Document</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={initialValues}
        validationSchema={documentSchema}
        onSubmit={async (values, { setSubmitting }) => {
          const {
            docType,
            docNumber,
            subject,
            hasWritingDate,
            writtenOn,
            sender,
            hasSendingDate,
            sentOn,
            recipients,
          } = values;
          setSubmitting(true);

          const recipientsParam = recipients.map((recipient) => {
            return {
              person: recipient.id,
              receivedOn: new Date(),
            };
          });

          const documentResponse = await addDocument({
            variables: {
              docNumber,
              docType,
              subject,
              sender,
              writtenOn: hasWritingDate ? writtenOn.toISOString() : null,
              sentOn: hasSendingDate ? sentOn.toISOString() : null,
              recipients: recipientsParam.map((recipient) => {
                return {
                  person: recipient.person,
                  receivedOn: recipient.receivedOn.toISOString(),
                };
              }),
            },
            update: (cache, { data }) => {
              if (!data || !data.addDocument) {
                return null;
              }

              const documents: any = cache.readQuery({
                query: DocumentsDocument,
              });
              const newDocument = data.addDocument;

              cache.writeQuery<DocumentsQuery>({
                query: DocumentsDocument,
                data: {
                  documents: {
                    status: {
                      status: 'ok',
                    },
                    documents: [
                      ...documents.documents.documents,
                      {
                        document: newDocument.document,
                      },
                    ],
                  },
                },
              });

              client.resetStore();
            },
          });

          if (!documentResponse || !documentResponse.data) {
            console.error('General error');
            return;
          }

          setSubmitting(false);
          setShow(false);
        }}
      >
        {({ errors, values, isSubmitting, isValid, setFieldValue }) => (
          <>
            <FormikForm>
              <Modal.Body>
                {values.recipients.some(
                  (rec: any) => rec.id === values.sender
                ) && (
                  <Alert variant="danger">
                    A person cannot send a message to themselves
                  </Alert>
                )}
                <Form.Row>
                  <Form.Group as={Col} xs={7}>
                    <Form.Control
                      as="select"
                      name="docType"
                      onChange={(event) => {
                        const newDocType = docTypesData.documentTypes.docTypes.find(
                          ({ id }) => '' + id === event.target.value
                        );

                        if (newDocType) setFieldValue('docType', newDocType.id);
                        else setFieldValue('docType', 7);
                      }}
                    >
                      {docTypesData.documentTypes.docTypes.map((docType) => (
                        <option key={docType.id} value={docType.id}>
                          {docType.typeName}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="Document No."
                      name="docNumber"
                      as={Form.Control}
                      isInvalid={!!errors.docNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.docNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="Subject"
                      name="subject"
                      as={Form.Control}
                      isInvalid={!!errors.subject}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.subject}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} xs={3}>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      name="hasWritingDate"
                      inline
                      label="Written on"
                    />
                  </Form.Group>
                  <Form.Group as={Col} xs={3}>
                    <Field
                      name="writtenOn"
                      as={DatePicker}
                      selected={values.writtenOn}
                      onChange={(date: any) => setFieldValue('writtenOn', date)}
                      disabled={!values.hasWritingDate}
                      maxDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      style={{ zIndex: 600 }}
                      className="rbt-input-main form-control rbt-input"
                    />
                  </Form.Group>
                  <Form.Group as={Col} xs={3}>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      name="hasSendingDate"
                      inline
                      label="Sent on"
                    />
                  </Form.Group>
                  <Form.Group as={Col} xs={3}>
                    <Field
                      name="sentOn"
                      as={DatePicker}
                      selected={values.sentOn}
                      onChange={(date: any) => setFieldValue('sentOn', date)}
                      disabled={!values.hasSendingDate}
                      maxDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      className="rbt-input-main form-control rbt-input"
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="Sender"
                      id="document-sender"
                      name="sender"
                      labelKey="label"
                      as={Typeahead}
                      options={perData.personNames.personNames}
                      onChange={(selected: any[]) => {
                        const sender = selected[0] ? selected[0].id : null;
                        setFieldValue('sender', sender);
                      }}
                      isInvalid={!!errors.sender}
                      className={classNames(!!errors.sender && 'is-invalid')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.sender}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Table striped bordered hover responsive size="sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Date</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.recipients.map(({ id, date }) => {
                          if (!id) return null;

                          const personEntry = perData.personNames.personNames.find(
                            (person) => id === person.id
                          );

                          if (!personEntry) return null;

                          const year = date.getFullYear();
                          const month = date.getMonth() + 1;
                          const day = date.getDate();

                          console.log(personEntry.label);

                          return (
                            <tr key={id}>
                              <td>{personEntry.label}</td>
                              <td>{`${day}/${month}/${year}`}</td>
                              <td>
                                <Button
                                  onClick={() => {
                                    setFieldValue(
                                      'recipients',
                                      values.recipients.filter(
                                        (rec) => rec.id !== id
                                      )
                                    );
                                  }}
                                >
                                  X
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} xs={7}>
                    <Typeahead
                      placeholder="Type a new recipient here"
                      id="new-recipient"
                      labelKey="label"
                      options={perData.personNames.personNames}
                      onChange={(selected: any[]) => {
                        const newRecipient = selected[0]
                          ? selected[0].id
                          : null;
                        setFieldValue('newRecipient', newRecipient);
                      }}
                      clearButton
                      ref={refQla}
                    />
                  </Form.Group>
                  <Col xs={4}>
                    <Field
                      name="newRecipientDate"
                      as={DatePicker}
                      selected={values.newRecipientDate}
                      onChange={(date: any) => {
                        setFieldValue('newRecipientDate', date);
                      }}
                      maxDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      style={{ zIndex: 600 }}
                      className="rbt-input-main form-control rbt-input"
                    />
                  </Col>
                  <Col xs={1}>
                    <Button
                      disabled={typeof values.newRecipient !== 'number'}
                      onClick={() => {
                        if (typeof values.newRecipient !== 'number') return;

                        if (
                          values.recipients.find(
                            (rec) => rec.id === values.newRecipient
                          )
                        ) {
                          if (refQla.current) {
                            refQla.current.clear();
                          }
                          return;
                        }

                        if (refQla.current) refQla.current.clear();

                        setFieldValue('recipients', [
                          ...values.recipients,
                          {
                            id: values.newRecipient,
                            date: values.newRecipientDate,
                          },
                        ]);
                      }}
                    >
                      +
                    </Button>
                  </Col>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      name="hasFiles"
                      label="Were electronic files attached?"
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Form.File
                      id="formcheck-api-custom"
                      custom
                      style={{ zIndex: 0 }}
                    >
                      <Form.File.Input disabled={!values.hasFiles} />
                      <Form.File.Label data-browse="Browse">
                        Insert a file
                      </Form.File.Label>
                    </Form.File>
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
                <Button
                  variant="primary"
                  disabled={
                    isSubmitting ||
                    !isValid ||
                    values.recipients.some(
                      (rec: any) => rec.id === values.sender
                    )
                  }
                  type="submit"
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
