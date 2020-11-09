import React, { useState } from 'react';
import {
  PersonsDocument,
  PersonsQuery,
  useDocumentsQuery,
  useAddDocumentMutation,
  useDocumentTypesQuery,
  usePersonsQuery,
} from '../generated/graphql';
import { Redirect } from 'react-router-dom';
import {
  Container,
  Form,
  Table,
  Col,
  Button,
  Row,
  Modal,
} from 'react-bootstrap';
import { FileEarmarkPlusFill } from 'react-bootstrap-icons';
import { Formik, Form as FormikForm, Field } from 'formik';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { DateButton } from '../components/DateButton';

type SearchCriterion = {
  criterion:
    | 'id'
    | 'docType'
    | 'docNumber'
    | 'subject'
    | 'writtenOn'
    | 'sender';
  displayName: string;
};

const searchCriteria: SearchCriterion[] = [
  {
    criterion: 'id',
    displayName: 'No.',
  },
  {
    criterion: 'docType',
    displayName: 'Document type',
  },
  {
    criterion: 'docNumber',
    displayName: 'Document no.',
  },
  {
    criterion: 'subject',
    displayName: 'Subject',
  },
  {
    criterion: 'sender',
    displayName: 'Sender',
  },
];

export const Documents: React.FC = () => {
  const {
    data: perData,
    loading: perLoading,
    error: perError,
  } = usePersonsQuery();
  const {
    data: docData,
    loading: docLoading,
    error: docError,
  } = useDocumentsQuery();
  const {
    data: docTypesData,
    loading: docTypesLoading,
    error: docTypesError,
  } = useDocumentTypesQuery();
  const [addDocument, { client }] = useAddDocumentMutation();
  const [searchCriterion, setSearchCriterion] = useState<SearchCriterion>(
    searchCriteria[0]
  );
  const [search, setSearch] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);

  if (docLoading || docTypesLoading || perLoading) {
    return <div>Loading...</div>;
  }

  if (docError || docTypesError || perError) {
    console.log(docError);
    return <div>Error</div>;
  }

  if (
    !docData ||
    !docData.documents ||
    !docTypesData ||
    !docTypesData.documentTypes ||
    !perData ||
    !perData.persons
  ) {
    return <Redirect to='/login' />;
  }

  return (
    <>
      <Container className='mt-3'>
        <Row>
          <Col className='d-flex'>
            <div>
              <h2 style={{ display: 'table-cell' }}>Documents</h2>
            </div>
            <Button className='ml-auto' onClick={() => setShowNewDialog(true)}>
              <FileEarmarkPlusFill size={24} />
            </Button>
          </Col>
        </Row>
        <Form>
          <Form.Group className='mt-3'>
            <Form.Row className='justify-content-md-center'>
              <Col xs={9}>
                <Form.Control
                  type='search'
                  placeholder='Search'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
              <Col xs='auto'>
                <Form.Control
                  as='select'
                  value={searchCriterion.criterion}
                  onChange={(event) => {
                    const newSearchCriterion = searchCriteria.find(
                      (crit) => crit.criterion === event.target.value
                    );

                    if (newSearchCriterion)
                      setSearchCriterion(newSearchCriterion);
                    else setSearchCriterion(searchCriteria[0]);
                  }}
                >
                  {searchCriteria.map((crit) => (
                    <option key={crit.criterion} value={crit.criterion}>
                      {crit.displayName}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col xs='auto'>
                <Button>Advanced</Button>
              </Col>
            </Form.Row>
          </Form.Group>
        </Form>
        <Table striped bordered hover responsive size='sm'>
          <colgroup>
            <col style={{ width: '32px' }}></col>
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th colSpan={2}>Type</th>
              <th>Subject</th>
              <th>Written on</th>
              <th>From</th>
            </tr>
          </thead>
          <tbody>
            {docData.documents.map((doc) => {
              const { document: docInfo, sender } = doc;
              const { id, docType, docNumber, subject, writtenOn } = docInfo;

              if (search.length !== 0) {
                let searchAttribute = '';
                switch (searchCriterion.criterion) {
                  case 'docType':
                    searchAttribute = docType!.typeName;
                    break;
                  case 'sender':
                    searchAttribute = sender.name;
                    break;
                  default:
                    searchAttribute = docInfo[
                      searchCriterion.criterion
                    ].toString();
                    break;
                }

                if (
                  searchAttribute &&
                  !searchAttribute
                    .toLocaleLowerCase()
                    .includes(search.toLocaleLowerCase())
                ) {
                  return null;
                }
              }

              return (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{docType.typeName}</td>
                  <td>{docNumber}</td>
                  <td>{subject}</td>
                  <td>
                    {writtenOn ? new Date(writtenOn).toDateString() : 'n/a'}
                  </td>
                  <td>{sender.name}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>
      <Modal show={showNewDialog} onHide={() => setShowNewDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Document</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
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
          }}
          onSubmit={async (values, { setSubmitting }) => {
            // const {
            //   name,
            //   rut,
            //   division,
            //   address,
            //   country,
            //   email,
            //   phone,
            // } = values;
            // setSubmitting(true);

            // const documentResponse = await addDocument({
            //   variables: {},
            //   // update: (cache, { data }) => {
            //   //   if (!data) return null;

            //   //   client.resetStore();
            //   // },
            // });

            // if (!documentResponse || !documentResponse.data) {
            //   console.error('General error');
            //   return;
            // }

            setSubmitting(false);
            setShowNewDialog(false);
          }}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <>
              <FormikForm>
                <Modal.Body>
                  <Form.Row>
                    <Form.Group as={Col} xs={7}>
                      <Form.Control
                        as='select'
                        name='docType'
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
                          <option key={docType.id} value={docType.id}>
                            {docType.typeName}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Field
                        placeholder='Document No.'
                        name='docNumber'
                        as={Form.Control}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Field
                        placeholder='Subject'
                        name='subject'
                        as={Form.Control}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Field
                        type='checkbox'
                        as={Form.Check}
                        name='hasWritingDate'
                        inline
                        label='Written on'
                      />
                      <Field
                        name='writtenOn'
                        as={DatePicker}
                        selected={values.writtenOn}
                        onChange={(date: any) =>
                          setFieldValue('writtenOn', date)
                        }
                        disabled={!values.hasWritingDate}
                        maxDate={new Date()}
                        dateFormat='dd/MM/yyyy'
                        style={{ zIndex: 600 }}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Field
                        type='checkbox'
                        as={Form.Check}
                        name='hasSendingDate'
                        inline
                        label='Sent on'
                      />
                      <Field
                        name='sentOn'
                        as={DatePicker}
                        selected={values.sentOn}
                        onChange={(date: any) => setFieldValue('sentOn', date)}
                        disabled={!values.hasSendingDate}
                        maxDate={new Date()}
                        dateFormat='dd/MM/yyyy'
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Field
                        placeholder='Sender'
                        name='sender'
                        as={Typeahead}
                        options={perData.persons.map((person) => {
                          if (person.division)
                            return {
                              id: person.id,
                              label: `${person.name} - ${person.division}`,
                            };
                          else return { id: person.id, label: person.name };
                        })}
                        onChange={(selected: any[]) => {
                          const sender = selected[0] ? selected[0].id : null;
                          setFieldValue('sender', sender);
                        }}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Field
                        placeholder='Recipients'
                        name='recipients'
                        as={Typeahead}
                        options={perData.persons
                          // .filter((person) => person.id !== values.sender)
                          .map((person) => {
                            if (person.division)
                              return {
                                id: person.id,
                                label: `${person.name} - ${person.division}`,
                              };
                            else return { id: person.id, label: person.name };
                          })}
                        onChange={(selected: any[]) => {
                          const selectedIds = selected.map((sel) => sel.id);
                          setFieldValue('recipients', selectedIds);
                        }}
                        multiple
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Field
                        type='checkbox'
                        as={Form.Check}
                        name='hasFiles'
                        label='Were electronic files attached?'
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Form.File
                        id='formcheck-api-custom'
                        custom
                        style={{ zIndex: 0 }}
                      >
                        <Form.File.Input disabled={!values.hasFiles} />
                        <Form.File.Label data-browse='Browse'>
                          Insert a file
                        </Form.File.Label>
                      </Form.File>
                    </Form.Group>
                  </Form.Row>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant='secondary'
                    onClick={() => setShowNewDialog(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant='primary'
                    disabled={isSubmitting}
                    type='submit'
                  >
                    {isSubmitting ? 'Hang on...' : 'Add'}
                  </Button>
                </Modal.Footer>
              </FormikForm>
            </>
          )}
        </Formik>
      </Modal>
    </>
  );
};
