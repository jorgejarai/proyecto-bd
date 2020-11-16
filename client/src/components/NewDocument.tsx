import React, { Dispatch, SetStateAction } from "react";
import {
  DocumentsQuery,
  DocumentTypesQuery,
  DocumentsDocument,
  useAddDocumentMutation,
  PersonsQuery,
} from "../generated/graphql";
import { Button, Col, Form, Modal } from "react-bootstrap";
import { Formik, Form as FormikForm, Field } from "formik";
import DatePicker from "react-datepicker";
import { Typeahead } from "react-bootstrap-typeahead";

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  docTypesData: DocumentTypesQuery;
  perData: PersonsQuery;
}

export const NewDocument: React.FC<Props> = ({
  show,
  setShow,
  docTypesData,
  perData,
}) => {
  const [addDocument, { client }] = useAddDocumentMutation();

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

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>New Document</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          docType: 7,
          docNumber: "",
          subject: "",
          hasWritingDate: false,
          writtenOn: new Date(),
          sender: 0,
          hasSendingDate: false,
          sentOn: new Date(),
          recipients: [],
          hasFiles: false,
          files: [],
        }}
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

          const recipientsParam = (recipients as number[]).map((recipient) => {
            return {
              person: recipient,
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
              recipients: recipientsParam,
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
                  documents: [
                    ...documents.documents,
                    {
                      document: newDocument.document,
                      sender: newDocument.sender,
                      recipients: newDocument.recipients,
                    },
                  ],
                },
              });

              client.resetStore();
            },
          });

          if (!documentResponse || !documentResponse.data) {
            console.error("General error");
            return;
          }

          setSubmitting(false);
          setShow(false);
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <>
            <FormikForm>
              <Modal.Body>
                <Form.Row>
                  <Form.Group as={Col} xs={7}>
                    <Form.Control
                      as="select"
                      name="docType"
                      onChange={(event) => {
                        const newDocType = docTypesData.documentTypes.find(
                          ({ id }) => "" + id === event.target.value
                        );

                        if (newDocType) setFieldValue("docType", newDocType.id);
                        else setFieldValue("docType", 7);
                      }}
                    >
                      {docTypesData.documentTypes.map((docType) => (
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
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="Subject"
                      name="subject"
                      as={Form.Control}
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      name="hasWritingDate"
                      inline
                      label="Written on"
                    />
                    <Field
                      name="writtenOn"
                      as={DatePicker}
                      selected={values.writtenOn}
                      onChange={(date: any) => setFieldValue("writtenOn", date)}
                      disabled={!values.hasWritingDate}
                      maxDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                      style={{ zIndex: 600 }}
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      name="hasSendingDate"
                      inline
                      label="Sent on"
                    />
                    <Field
                      name="sentOn"
                      as={DatePicker}
                      selected={values.sentOn}
                      onChange={(date: any) => setFieldValue("sentOn", date)}
                      disabled={!values.hasSendingDate}
                      maxDate={new Date()}
                      dateFormat="dd/MM/yyyy"
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="Sender"
                      id="document-sender"
                      name="sender"
                      as={Typeahead}
                      options={personsList}
                      onChange={(selected: any[]) => {
                        const sender = selected[0] ? selected[0].id : null;
                        setFieldValue("sender", sender);
                      }}
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col}>
                    <Field
                      placeholder="Recipients"
                      id="document-recipients"
                      name="recipients"
                      as={Typeahead}
                      options={personsList}
                      onChange={(selected: any[]) => {
                        const selectedIds = selected.map((sel) => sel.id);
                        setFieldValue("recipients", selectedIds);
                      }}
                      multiple
                    />
                  </Form.Group>
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
                <Button variant="primary" disabled={isSubmitting} type="submit">
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
