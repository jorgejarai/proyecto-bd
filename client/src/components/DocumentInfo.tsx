import React, { Dispatch, SetStateAction } from "react";
import { Button, Col, Form, Modal } from "react-bootstrap";
import { Formik, Form as FormikForm, Field } from "formik";
import DatePicker from "react-datepicker";
import { Typeahead } from "react-bootstrap-typeahead";
import {
  DocumentQuery,
  DocumentTypesQuery,
  PersonsQuery,
} from "../generated/graphql";

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  docData: DocumentQuery;
  docTypesData: DocumentTypesQuery;
  perData: PersonsQuery;
}

export const DocumentInfo: React.FC<Props> = ({
  show,
  setShow,
  docData,
  docTypesData,
  perData,
}) => {
  if (!docData.document) return <h1>Nada</h1>;

  const { document: doc, sender, recipients, sentOn } = docData.document;

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
      <Modal.Header>
        <Modal.Title>Document No." "{doc.id}</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{ ...doc, sentOn }}
        onSubmit={() => console.log("Hola")}
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
                      disabled={!values.writtenOn}
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
                      disabled={!values.sentOn}
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
              </Modal.Body>
            </FormikForm>

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
          </>
        )}
      </Formik>
    </Modal>
  );
};
