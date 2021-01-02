import { Formik, Form as FormikForm, Field } from 'formik';
import React, { Dispatch, SetStateAction } from 'react';
import { Button, Form, Modal, Col, Row } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import DatePicker from 'react-datepicker';
import loadingImage from '../assets/loading.svg';
import { useDocumentTypesQuery, useUsersQuery } from '../generated/graphql';
import { searchCriteriaTypes, SearchCriterionEntry } from '../searchCriteria';

interface Props {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  setCriterion: Dispatch<SetStateAction<SearchCriterionEntry[]>>;
}

export const AdvancedDocSearch: React.FC<Props> = ({
  show,
  setShow,
  setCriterion,
}) => {
  const {
    data: docTypesData,
    loading: docTypesLoading,
    error: docTypesError,
  } = useDocumentTypesQuery();
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useUsersQuery();

  if (docTypesLoading || usersLoading) {
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>Advanced Search</Modal.Title>
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
    docTypesData.documentTypes.status.status === 'error' ||
    usersError ||
    !usersData ||
    !usersData.users ||
    usersData.users.status.status === 'error'
  ) {
    return (
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header>
          <Modal.Title>Advanced Search</Modal.Title>
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

  return (
    <Modal show={show} onHide={() => setShow(false)} size="lg">
      <Modal.Header>
        <Modal.Title>Advanced Search</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{
          writtenOn: false,
          writtenOnStart: new Date(),
          writtenOnEnd: new Date(),
          sentOn: false,
          sentOnStart: new Date(),
          sentOnEnd: new Date(),
          docType: false,
          docTypeValue: 0,
          recorder: false,
          recorderValue: 0,
          keyword: false,
          keywordCriterion: '',
          keywordValue: '',
        }}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);

          let criteria: SearchCriterionEntry[] = [];

          if (values.writtenOn) {
            criteria.push({
              criterion: 'writtenOn',
              value: {
                start: values.writtenOnStart,
                end: values.writtenOnEnd,
              },
            });
          }

          if (values.sentOn) {
            criteria.push({
              criterion: 'sentOn',
              value: {
                start: values.sentOnStart,
                end: values.sentOnEnd,
              },
            });
          }

          if (values.docType) {
            criteria.push({
              criterion: 'docType',
              value: values.docTypeValue,
            });
          }

          if (values.recorder) {
            criteria.push({
              criterion: 'recorder',
              value: values.recorderValue,
            });
          }

          if (values.keyword) {
            criteria.push({
              criterion: 'keyword',
              value: values.keywordValue,
            });
          }

          console.log(criteria);

          setCriterion([...criteria]);

          setSubmitting(false);
          setShow(false);
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <>
            <FormikForm>
              <Modal.Body>
                <Form.Group>
                  <Form.Row>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      aria-label="Writing date"
                      name="writtenOn"
                    />
                    <Form.Label column xs={2}>
                      Written from:
                    </Form.Label>
                    <Col xs={2}>
                      <Field
                        name="writtenOnStart"
                        as={DatePicker}
                        selected={values.writtenOnStart}
                        onChange={(date: any) =>
                          setFieldValue('writtenOnStart', date)
                        }
                        className="rbt-input-main form-control rbt-input"
                        disabled={!values.writtenOn}
                        selectsStart
                        startDate={values.writtenOnStart}
                        endDate={values.writtenOnEnd}
                      />
                    </Col>
                    <Form.Label column xs={1}>
                      until:
                    </Form.Label>
                    <Col xs={2}>
                      <Field
                        name="writtenOnStop"
                        as={DatePicker}
                        selected={values.writtenOnEnd}
                        onChange={(date: any) =>
                          setFieldValue('writtenOnEnd', date)
                        }
                        className="rbt-input-main form-control rbt-input"
                        disabled={!values.writtenOn}
                        selectsEnd
                        startDate={values.writtenOnStart}
                        endDate={values.writtenOnEnd}
                        minDate={values.writtenOnStart}
                      />
                    </Col>
                  </Form.Row>
                </Form.Group>
                <Form.Group>
                  <Form.Row>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      aria-label="Sending date"
                      name="sentOn"
                    />
                    <Form.Label column xs={2}>
                      Sent from:
                    </Form.Label>
                    <Col xs={2}>
                      <Field
                        name="sentOnStart"
                        as={DatePicker}
                        selected={values.sentOnStart}
                        onChange={(date: any) =>
                          setFieldValue('sentOnStart', date)
                        }
                        className="rbt-input-main form-control rbt-input"
                        disabled={!values.sentOn}
                        selectsStart
                        startDate={values.sentOnStart}
                        endDate={values.sentOnEnd}
                      />
                    </Col>
                    <Form.Label column xs={1}>
                      until:
                    </Form.Label>
                    <Col xs={2}>
                      <Field
                        name="sentOnEnd"
                        as={DatePicker}
                        selected={values.sentOnEnd}
                        onChange={(date: any) =>
                          setFieldValue('sentOnEnd', date)
                        }
                        className="rbt-input-main form-control rbt-input"
                        disabled={!values.sentOn}
                        selectsEnd
                        startDate={values.sentOnStart}
                        endDate={values.sentOnEnd}
                        minDate={values.sentOnStart}
                      />
                    </Col>
                  </Form.Row>
                </Form.Group>
                <Form.Group>
                  <Form.Row>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      aria-label="Sending date"
                      name="docType"
                    />
                    <Form.Label column xs={2}>
                      Document type:
                    </Form.Label>
                    <Col xs={4}>
                      <Form.Control
                        as="select"
                        name="docTypeValue"
                        onChange={(event) => {
                          const newDocType = docTypesData.documentTypes.docTypes.find(
                            ({ id }) => '' + id === event.target.value
                          );

                          if (newDocType)
                            setFieldValue('docTypeValue', newDocType.id);
                          else setFieldValue('docTypeValue', 7);
                        }}
                        disabled={!values.docType}
                      >
                        {docTypesData.documentTypes.docTypes.map((docType) => (
                          <option key={docType.id} value={docType.id}>
                            {docType.typeName}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Form.Row>
                </Form.Group>
                <Form.Group>
                  <Form.Row>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      aria-label="Recorded by"
                      name="recorder"
                    />
                    <Form.Label column xs={2}>
                      Recorded by:
                    </Form.Label>
                    <Col xs={8}>
                      <Field
                        id="recorder-value"
                        name="recorderValue"
                        labelKey="name"
                        as={Typeahead}
                        options={usersData.users.users}
                        onChange={(selected: any[]) => {
                          const recorderValue = selected[0]
                            ? selected[0].id
                            : null;
                          setFieldValue('recorderValue', recorderValue);
                        }}
                        disabled={!values.recorder}
                      />
                    </Col>
                  </Form.Row>
                </Form.Group>
                <Form.Group>
                  <Form.Row>
                    <Field
                      type="checkbox"
                      as={Form.Check}
                      aria-label="Keyword"
                      name="keyword"
                    />
                    <Form.Label column xs={2}>
                      Keyword:
                    </Form.Label>
                    <Col xs={4}>
                      <Form.Control
                        as="select"
                        value={values.keywordCriterion}
                        onChange={(event) => {
                          const newSearchCriterion = searchCriteriaTypes.find(
                            (crit) => crit.criterion === event.target.value
                          );

                          if (newSearchCriterion)
                            setFieldValue(
                              'keywordCriterion',
                              newSearchCriterion.criterion
                            );
                          else
                            setFieldValue(
                              'keywordCriterion',
                              searchCriteriaTypes[0].criterion
                            );
                        }}
                        disabled={!values.keyword}
                      >
                        {searchCriteriaTypes.map((crit) => (
                          <option key={crit.criterion} value={crit.criterion}>
                            {crit.displayName}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col xs={4}>
                      <Field
                        name="keywordValue"
                        as={Form.Control}
                        disabled={!values.keyword}
                      />
                    </Col>
                  </Form.Row>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={
                    !values.writtenOn &&
                    !values.sentOn &&
                    !values.docType &&
                    !values.recorder &&
                    !values.keyword
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
  );
};
