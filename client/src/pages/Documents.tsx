import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  DocumentOutput,
  useDocumentsQuery,
  useDocumentTypesQuery,
  useMeQuery,
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
  DateRange,
  DocumentTypeDisplay,
  RecorderDisplay,
  SearchCriterionEntry,
  SearchCriterionType,
  searchCriteriaTypes,
  KeywordSearchCriterion,
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

const displayAdvancedCriteria = (criteria: SearchCriterionEntry[]) => {
  return (
    <ul>
      {criteria.map(({ criterion, value }) => {
        switch (criterion) {
          case 'writtenOn': {
            const startDate = (value as DateRange).start.toLocaleDateString();
            const endDate = (value as DateRange).end.toLocaleDateString();

            return <li>{`Written from ${startDate} until ${endDate}`}</li>;
          }
          case 'sentOn': {
            const startDate = (value as DateRange).start.toLocaleDateString();
            const endDate = (value as DateRange).end.toLocaleDateString();

            return <li>{`Sent from ${startDate} until ${endDate}`}</li>;
          }
          case 'receivedOn': {
            const startDate = (value as DateRange).start.toLocaleDateString();
            const endDate = (value as DateRange).end.toLocaleDateString();

            return <li>{`Received from ${startDate} until ${endDate}`}</li>;
          }
          case 'docType':
            return (
              <li>{`Document type: ${(value as DocumentTypeDisplay).name}`}</li>
            );
          case 'recorder':
            return <li>{`Recorded by: ${(value as RecorderDisplay).name}`}</li>;
          case 'keyword': {
            let criterionDisplayName = '';

            switch ((value as KeywordSearchCriterion).type) {
              case 'id':
                criterionDisplayName = 'ID no.';
                break;
              case 'docNumber':
                criterionDisplayName = 'Document no.';
                break;
              case 'subject':
                criterionDisplayName = 'Subject';
                break;
              case 'sender':
                criterionDisplayName = 'Sender name';
                break;
            }

            return (
              <li>{`${criterionDisplayName}
               contains ${(value as KeywordSearchCriterion).value}`}</li>
            );
          }
        }

        return null;
      })}
    </ul>
  );
};

const displayDocuments = (
  currRecipient: number,
  documents: DocumentOutput[],
  searchCriterion: SearchCriterionType,
  search: string,
  advancedCriteria: SearchCriterionEntry[],
  onDblClick: (id: number) => void
) => {
  if (!currRecipient) {
    return (
      <tr>
        <td colSpan={6}>
          <p className="text-center mt-3">
            Please set up a recipient for looking at their documents.'
          </p>
        </td>
      </tr>
    );
  }

  if (documents.length === 0) {
    return (
      <tr>
        <td colSpan={6}>
          <p className="text-center mt-3">
            This person has not received any documents yet
          </p>
        </td>
      </tr>
    );
  }

  if (advancedCriteria.length > 0) {
    let finalDocuments: DocumentOutput[] = [...documents];

    advancedCriteria.forEach(({ criterion, value }) => {
      switch (criterion) {
        case 'writtenOn': {
          const startDate = new Date((value as DateRange).start.setHours(0,0,0,0));
          const endDate = new Date((value as DateRange).end.setHours(23,59,59,999));

          finalDocuments = finalDocuments.filter((doc) => {
            if (!doc.writtenOn) return false;

            const date = new Date(doc.writtenOn);
            return date && date >= startDate && date <= endDate;
          });

          break;
        }
        case 'sentOn': {
          const startDate = new Date((value as DateRange).start.setHours(0,0,0,0));
          const endDate = new Date((value as DateRange).end.setHours(23,59,59,999));

          finalDocuments = finalDocuments.filter((doc) => {
            if (!doc.sentOn) return false;

            const date = new Date(doc.sentOn);
            return date && date >= startDate && date <= endDate;
          });

          break;
        }
        case 'receivedOn': {
          const startDate = new Date((value as DateRange).start.setHours(0,0,0,0));
          const endDate = new Date((value as DateRange).end.setHours(23,59,59,999));

          finalDocuments = finalDocuments.filter((doc) => {
            const receivedOn = doc.recipients!.find((rec) => rec.person.id === currRecipient)?.receivedOn!

            const date = new Date(`${receivedOn} 00:00`);

            console.log(startDate, date, endDate)
            return date && date >= startDate && date <= endDate;
          });

          break;
        }
        case 'docType': {
          finalDocuments = finalDocuments.filter((doc) => {
            return doc.docType.id === (value as DocumentTypeDisplay).id;
          });

          break;
        }
        case 'recorder': {
          finalDocuments = finalDocuments.filter((doc) => {
            return doc.recordedBy.id === (value as RecorderDisplay).id;
          });

          break;
        }
        case 'keyword': {
          finalDocuments = finalDocuments.filter((doc) => {
            const type = (value as KeywordSearchCriterion).type;
            const val = (value as KeywordSearchCriterion).value;

            return doc[type]!.toString()
              .toLocaleLowerCase()
              .includes(val.toLocaleLowerCase());
          });
        }
      }
    });

    if (finalDocuments.length === 0) {
      return (
        <tr>
          <td colSpan={6}>
            <p className="text-center mt-3">No documents were found</p>
          </td>
        </tr>
      );
    }

    return [...finalDocuments].sort(({id: a}, {id: b}) => a - b).map
      (({ id, docType, docNumber, subject, writtenOn, sender }) => (
          <tr key={id} onDoubleClick={() => onDblClick(id)}>
            <td>{id}</td>
            <td>{docType.typeName}</td>
            <td>{docNumber}</td>
            <td>{subject}</td>
            <td>{writtenOn ? new Date(writtenOn).toISOString().slice(0, 10) : 'n/a'}</td>
            <td>{sender?.name}</td>
          </tr>
        )
    )
  } else {
    return [...documents].sort(({id: a}, {id: b}) => a - b).map((doc) => {
      const { id, docType, docNumber, subject, writtenOn, sender } = doc;

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
        <tr key={id} onDoubleClick={() => onDblClick(id)}>
          <td>{id}</td>
          <td>{docType.typeName}</td>
          <td>{docNumber}</td>
          <td>{subject}</td>
          <td>{writtenOn ? new Date(writtenOn).toISOString().slice(0, 10) : 'n/a'}</td>
          <td>{sender?.name}</td>
        </tr>
      );
    });
  }
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
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useMeQuery();

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

  useEffect(() => {
    setAdvancedSearch(advancedCriteria.length > 0);
  }, [setAdvancedSearch, advancedCriteria]);

  if (docLoading || docTypesLoading || perLoading || meLoading) {
    return <Loading />;
  }

  if (docError || docTypesError || perError || meError) {
    return <div>Error</div>;
  }

  if (
    !docData ||
    !docData.documents ||
    !docTypesData ||
    !docTypesData.documentTypes ||
    !perData ||
    !perData.persons ||
    !meData ||
    !meData.me
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
            {meData.me.user?.isClerk && <Button className="ml-2" onClick={() => setShowNewDialog(true)}>
              <FileEarmarkPlusFill size={24} />
            </Button>}
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
            onClose={() => setAdvancedCriteria([])}
            dismissible
          >
            Advanced search (documents must satifsfy each and every one of the
            following conditions): {displayAdvancedCriteria(advancedCriteria)}
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
            {displayDocuments(
              currRecipient,
              receivedDocuments,
              searchCriterion,
              search,
              advancedCriteria,
              (id) => {
                setCurrDocument(id);
                setShowInfoDialog(true);
              }
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
