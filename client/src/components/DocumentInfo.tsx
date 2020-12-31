import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field } from 'formik';
import DatePicker from 'react-datepicker';
import { Typeahead } from 'react-bootstrap-typeahead';
import {
  useDocumentQuery,
  usePersonNamesQuery,
  useDocumentTypesQuery,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  DocumentsDocument,
  DocumentsQuery,
} from '../generated/graphql';
import loadingImage from '../assets/loading.svg';
import { DeleteDocument } from './DeleteDocument';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  docId: number;
}

interface FormInitialValues {
  docType: number;
  docNumber: string | null | undefined;
  subject: string;
  hasWritingDate: boolean;
  writtenOn: Date | null | undefined;
  sender: number;
  hasSendingDate: boolean;
  sentOn: Date | null | undefined;
  recipients: { id: number; date: Date }[];
  hasFiles: boolean;
  files: never[];
  newRecipient: number | null | undefined;
  newRecipientDate: Date;
}

export const DocumentInfo: React.FC<Props> = ({ show, setShow, docId }) => {
  const {
    data: docData,
    loading: docLoading,
    error: docError,
  } = useDocumentQuery({
    variables: { id: docId },
  });
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
  const [updateDocument, { client }] = useUpdateDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();

  const [showDelete, setShowDelete] = useState(false);

  const refQla: any = useRef();

  if (docLoading || docTypesLoading || perLoading) {
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>Document No.{` ${docId}`}</Modal.Title>
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
    docError ||
    !docData ||
    !docData.document ||
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
          <Modal.Title>Document No.{` ${docId}`}</Modal.Title>
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

  const { document: doc, sender, recipients, sentOn } = docData.document;

  const initialValues: FormInitialValues = {
    docType: doc.docType.id,
    docNumber: doc.docNumber,
    subject: doc.subject,
    hasWritingDate: !!doc.writtenOn,
    writtenOn: doc.writtenOn ? new Date(doc.writtenOn) : null,
    sender: sender.id,
    hasSendingDate: !!sentOn,
    sentOn: sentOn ? new Date(sentOn) : null,
    recipients: recipients.map((rec) => ({
      id: rec.person.id,
      date: new Date(rec.receivedOn),
    })),
    hasFiles: false,
    files: [],
    newRecipient: null,
    newRecipientDate: new Date(),
  };

  const senderName = perData.personNames.find((per) => per.id === sender.id)!
    .label;

  return (
    <>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>Document No.{` ${docId}`}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={initialValues}
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
                receivedOn: recipient.date.toISOString(),
              };
            });

            const documentResponse = await updateDocument({
              variables: {
                docId: docId,
                metadata: {
                  docNumber,
                  subject,
                  writtenOn: hasWritingDate ? writtenOn?.toISOString() : null,
                  docType,
                  sentOn: hasSendingDate ? sentOn?.toISOString() : null,
                },
                sender,
                recipients: recipientsParam,
              },
              update: (cache, { data }) => {
                if (!data || !data.updateDocument) {
                  return null;
                }

                const cachedDocuments: any = cache.readQuery({
                  query: DocumentsDocument,
                });
                let documentsList = cachedDocuments.documents.filter(
                  (doc: any) => doc.id !== docId
                );
                const modifiedDocument = data.updateDocument;

                cache.writeQuery<DocumentsQuery>({
                  query: DocumentsDocument,
                  data: {
                    documents: [...documentsList, modifiedDocument],
                  },
                });

                client.resetStore();
              },
            });

            if (!documentResponse || !documentResponse.data) {
              console.error('General error');
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
                          const newDocType = docTypesData.documentTypes.find(
                            ({ id }) => '' + id === event.target.value
                          );

                          if (newDocType)
                            setFieldValue('docType', newDocType.id);
                          else setFieldValue('docType', 7);
                        }}
                      >
                        {docTypesData.documentTypes.map((docType) => (
                          <option
                            key={docType.id}
                            value={docType.id}
                            selected={doc.docType.id === docType.id}
                          >
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
                        invalid={!!errors.docNumber}
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
                        onChange={(date: any) =>
                          setFieldValue('writtenOn', date)
                        }
                        disabled={!values.hasWritingDate}
                        maxDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        style={{ zIndex: 600 }}
                        className="rbt-input-main form-control rbt-input"
                        isInvalid={!!errors.writtenOn}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.writtenOn}
                      </Form.Control.Feedback>
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
                        isInvalid={!!errors.sentOn}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.sentOn}
                      </Form.Control.Feedback>
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
                        options={perData.personNames}
                        onChange={(selected: any[]) => {
                          const sender = selected[0] ? selected[0].id : null;
                          setFieldValue('sender', sender);
                        }}
                        defaultInputValue={senderName}
                        isInvalid={!!errors.sender}
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

                            const personEntry = perData.personNames.find(
                              (person) => id === person.id
                            );

                            if (!personEntry) return null;

                            const year = date.getFullYear();
                            const month = date.getMonth() + 1;
                            const day = date.getDate();

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
                        options={perData.personNames}
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
                    variant="danger"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShow(false);
                      setShowDelete(true);
                    }}
                  >
                    {isSubmitting ? 'Hang on...' : 'Delete'}
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
                    {isSubmitting ? 'Hang on...' : 'OK'}
                  </Button>
                </Modal.Footer>
              </FormikForm>
            </>
          )}
        </Formik>
      </Modal>
      <DeleteDocument
        show={showDelete}
        onSuccessfulClose={async () => {
          const deleteResponse = await deleteDocument({
            variables: { id: docId },
            update: (cache, { data }) => {
              if (!data || !data.deleteDocument) {
                return null;
              }

              const cachedDocuments: any = cache.readQuery({
                query: DocumentsDocument,
              });
              const modifiedDocuments = cachedDocuments.documents.filter(
                (doc: any) => doc.document.id !== docId
              );

              cache.writeQuery<DocumentsQuery>({
                query: DocumentsDocument,
                data: {
                  documents: modifiedDocuments,
                },
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
