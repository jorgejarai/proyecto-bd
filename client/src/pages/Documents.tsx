import React, { Dispatch, SetStateAction, useState } from "react";
import {
  useDocumentsQuery,
  useDocumentTypesQuery,
  usePersonsQuery,
} from "../generated/graphql";
import { Redirect } from "react-router-dom";
import { Container, Form, Table, Col, Button, Row } from "react-bootstrap";
import { Sliders, FileEarmarkPlusFill } from "react-bootstrap-icons";
import "react-datepicker/dist/react-datepicker.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import Loader from "react-loader-spinner";
import { NewDocument } from "../components/NewDocument";
import { PersonSettings } from "../components/PersonSettings";
import { DocumentInfo } from "../components/DocumentInfo";

const useStateWithLocalStorage = (
  localStorageKey: string
): [number, Dispatch<SetStateAction<number>>] => {
  const [value, setValue] = React.useState(
    parseInt(localStorage.getItem(localStorageKey) || "0")
  );

  React.useEffect(() => {
    localStorage.setItem(localStorageKey, value.toString());

    // eslint-disable-next-line
  }, [value]);

  return [value, setValue];
};

type SearchCriterion = {
  criterion:
    | "id"
    | "docType"
    | "docNumber"
    | "subject"
    | "writtenOn"
    | "sender";
  displayName: string;
};

const searchCriteria: SearchCriterion[] = [
  {
    criterion: "id",
    displayName: "No.",
  },
  {
    criterion: "docType",
    displayName: "Document type",
  },
  {
    criterion: "docNumber",
    displayName: "Document no.",
  },
  {
    criterion: "subject",
    displayName: "Subject",
  },
  {
    criterion: "sender",
    displayName: "Sender",
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
  const [searchCriterion, setSearchCriterion] = useState<SearchCriterion>(
    searchCriteria[0]
  );
  const [search, setSearch] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [currRecipient, setCurrRecipient] = useStateWithLocalStorage(
    "recipient"
  );
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  if (docLoading || docTypesLoading || perLoading) {
    return <Loader type="Puff" color="#00bfff" height={100} width={100} />;
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

  return (
    <>
      <Container className="mt-3">
        <Row>
          <Col className="d-flex">
            <div>
              <h2 style={{ display: "table-cell" }}>Documents</h2>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
              <Col xs="auto">
                <Form.Control
                  as="select"
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
              <Col xs="auto">
                <Button>Advanced</Button>
              </Col>
            </Form.Row>
          </Form.Group>
        </Form>
        <Table striped bordered hover responsive size="sm">
          <colgroup>
            <col style={{ width: "32px" }}></col>
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
            {currRecipient ? (
              docData.documents
                .filter((doc) =>
                  doc.recipients.some((rec) => rec.person.id === currRecipient)
                )
                .map((doc) => {
                  const { document: docInfo, sender } = doc;
                  const {
                    id,
                    docType,
                    docNumber,
                    subject,
                    writtenOn,
                  } = docInfo;

                  if (search.length !== 0) {
                    let searchAttribute = "";
                    switch (searchCriterion.criterion) {
                      case "docType":
                        searchAttribute = docType!.typeName;
                        break;
                      case "sender":
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
                        {writtenOn ? new Date(writtenOn).toDateString() : "n/a"}
                      </td>
                      <td>{sender.name}</td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan={6}>
                  <p className="text-center">
                    Please set up a recipient for looking at their documents.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
      <NewDocument
        show={showNewDialog}
        setShow={setShowNewDialog}
        docTypesData={docTypesData}
        perData={perData}
      />
      <PersonSettings
        show={showSettingsDialog}
        setShow={setShowSettingsDialog}
        perData={perData}
        recipient={currRecipient}
        setRecipient={setCurrRecipient}
      />
    </>
  );
};
