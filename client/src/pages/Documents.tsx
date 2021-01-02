import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  useDocumentsQuery,
  useDocumentTypesQuery,
  usePersonsQuery,
} from '../generated/graphql';
import { Redirect } from 'react-router-dom';
import {
  Alert,
  Container,
  Form,
  Table,
  Col,
  Button,
  Row,
} from 'react-bootstrap';
import { Sliders, FileEarmarkPlusFill } from 'react-bootstrap-icons';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Loading } from '../components/Loading';
import { NewDocument } from '../components/NewDocument';
import { PersonSettings } from '../components/PersonSettings';
import { DocumentInfo } from '../components/DocumentInfo';
import { AdvancedDocSearch } from '../components/AdvancedDocSearch';
import {
  SearchCriterionEntry,
  SearchCriterionType,
  searchCriteriaTypes,
} from '../searchCriteria';

const useStateWithLocalStorage = (
  localStorageKey: string
): [number, Dispatch<SetStateAction<number>>] => {
  const [value, setValue] = React.useState(
    parseInt(localStorage.getItem(localStorageKey) || '0')
  );

  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value.toString());

    // eslint-disable-next-line
  }, [value]);

  return [value, setValue];
};

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

  const [searchCriterion, setSearchCriterion] = useState<SearchCriterionType>(
    searchCriteriaTypes[0]
  );
  const [search, setSearch] = useState('');
  const [currRecipient, setCurrRecipient] = useStateWithLocalStorage(
    'recipient'
  );
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [advancedCriteria, setAdvancedCriteria] = useState<
    SearchCriterionEntry[]
  >([]);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [currDocument, setCurrDocument] = useState(0);

  if (docLoading || docTypesLoading || perLoading) {
    return <Loading />;
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
    return <Redirect to="/login" />;
  }

  const receivedDocuments = docData.documents.documents.filter((doc) =>
    doc?.recipients?.some((rec) => rec.person.id === currRecipient)
  );

  return (
    <>
      <Container className="mt-3">
        <Row>
          <Col className="d-flex">
            <div>
              <h2 style={{ display: 'table-cell' }}>Documents</h2>
            </div>
            <Button
              variant="outline-primary"
              className="ml-auto"
              onClick={() => setShowSettingsDialog(true)}
            >
              <Sliders size={24} />
            </Button>
            <Button className="ml-2" onClick={() => setShowNewDialog(true)}>
              <FileEarmarkPlusFill size={24} />
            </Button>
          </Col>
        </Row>
        <Form>
          <Form.Group className="mt-3">
            <Form.Row className="justify-content-md-center">
              <Col xs={9}>
                <Form.Control
                  type="search"
                  placeholder="Search"
                  value={advancedSearch ? 'Advanced search' : search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={advancedSearch}
                />
              </Col>
              <Col xs="auto">
                <Form.Control
                  as="select"
                  value={searchCriterion.criterion}
                  onChange={(event) => {
                    const newSearchCriterion = searchCriteriaTypes.find(
                      (crit) => crit.criterion === event.target.value
                    );

                    if (newSearchCriterion)
                      setSearchCriterion(newSearchCriterion);
                    else setSearchCriterion(searchCriteriaTypes[0]);
                  }}
                  disabled={advancedSearch}
                >
                  {searchCriteriaTypes.map((crit) => (
                    <option key={crit.criterion} value={crit.criterion}>
                      {crit.displayName}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col xs="auto">
                <Button onClick={() => setShowAdvancedSearch(true)}>
                  Advanced
                </Button>
              </Col>
            </Form.Row>
          </Form.Group>
        </Form>
        {advancedSearch && (
          <Alert
            variant="info"
            onClose={() => setAdvancedSearch(false)}
            dismissible
          >
            Advanced search: <i>criteria</i>
            <br />
            Close this message to clear the search
          </Alert>
        )}
        <Table striped bordered hover responsive size="sm">
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
            {currRecipient && receivedDocuments.length > 0 ? (
              receivedDocuments.map((doc) => {
                const {
                  id,
                  docType,
                  docNumber,
                  subject,
                  writtenOn,
                  sender,
                } = doc;

                if (search.length !== 0) {
                  let searchAttribute: string | undefined | null = '';
                  switch (searchCriterion.criterion) {
                    case 'id':
                      searchAttribute = id.toString();
                      break;
                    case 'docType':
                      searchAttribute = docType!.typeName;
                      break;
                    case 'docNumber':
                      searchAttribute = docNumber;
                      break;
                    case 'subject':
                      searchAttribute = subject;
                      break;
                    case 'sender':
                      searchAttribute = sender?.name;
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
                  <tr
                    key={id}
                    onDoubleClick={() => {
                      setCurrDocument(id);
                      setShowInfoDialog(true);
                    }}
                  >
                    <td>{id}</td>
                    <td>{docType.typeName}</td>
                    <td>{docNumber}</td>
                    <td>{subject}</td>
                    <td>
                      {writtenOn ? new Date(writtenOn).toDateString() : 'n/a'}
                    </td>
                    <td>{sender?.name}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <p className="text-center mt-3">
                    {!currRecipient &&
                      'Please set up a recipient for looking at their documents.'}
                    {currRecipient &&
                      receivedDocuments.length === 0 &&
                      'This person has not received any documents yet'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
      <NewDocument show={showNewDialog} setShow={setShowNewDialog} />
      <PersonSettings
        show={showSettingsDialog}
        setShow={setShowSettingsDialog}
        recipient={currRecipient}
        setRecipient={setCurrRecipient}
      />
      <DocumentInfo
        show={showInfoDialog}
        setShow={setShowInfoDialog}
        docId={currDocument}
      />
      <AdvancedDocSearch
        show={showAdvancedSearch}
        setShow={setShowAdvancedSearch}
        setCriterion={setAdvancedCriteria}
      />
    </>
  );
};
