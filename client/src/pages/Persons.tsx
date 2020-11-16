import React, { useState } from "react";
import { useCountriesQuery, usePersonsQuery } from "../generated/graphql";
import { Redirect } from "react-router-dom";
import { Container, Form, Table, Col, Row, Button } from "react-bootstrap";
import { PersonPlusFill } from "react-bootstrap-icons";
import Loader from "react-loader-spinner";
import { NewPerson } from "../components/NewPerson";

type SearchCriterion = {
  criterion: "rut" | "name" | "division" | "email" | "phone";
  displayName: string;
};

const searchCriteria: SearchCriterion[] = [
  {
    criterion: "rut",
    displayName: "RUT",
  },
  {
    criterion: "name",
    displayName: "Name",
  },
  {
    criterion: "division",
    displayName: "Division",
  },
  {
    criterion: "email",
    displayName: "Email",
  },
  {
    criterion: "phone",
    displayName: "Phone",
  },
];

export const Persons: React.FC = () => {
  const {
    data: perData,
    loading: perLoading,
    error: perError,
  } = usePersonsQuery();
  const {
    data: counData,
    loading: counLoading,
    error: counError,
  } = useCountriesQuery();
  const [searchCriterion, setSearchCriterion] = useState<SearchCriterion>(
    searchCriteria[0]
  );
  const [search, setSearch] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);

  if (perLoading || counLoading) {
    return <Loader type="Puff" color="#00bfff" height={100} width={100} />;
  }

  if (perError || counError) {
    console.log(perError);
    return <div>Error</div>;
  }

  console.log(counData);

  if (!perData || !perData.persons || !counData || !counData.countries) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <Container className="mt-3">
        <Row>
          <Col className="d-flex">
            <div>
              <h2 style={{ display: "table-cell" }}>Persons</h2>
            </div>
            <Button className="ml-auto" onClick={() => setShowNewDialog(true)}>
              <PersonPlusFill size={24} />
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
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>RUT</th>
              <th>Name</th>
              <th>Address</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {perData.persons.map((person) => {
              if (!person || !person.person || !person.address) return null;

              const { id, rut, name, division, phone, email } = person.person;
              const { address, country } = person.address;

              if (search.length !== 0) {
                const searchAttribute = person.person[
                  searchCriterion.criterion
                ]?.toLocaleString();
                console.log(searchAttribute);

                if (
                  searchAttribute &&
                  !searchAttribute
                    .toLocaleLowerCase()
                    .includes(search.toLocaleLowerCase())
                )
                  return null;
              }

              return (
                <tr key={id}>
                  <td>{rut}</td>
                  <td>{division ? `${name} - ${division}` : `${name}`}</td>
                  <td>{`${address}, ${country.name}`}</td>
                  <td>{email}</td>
                  <td>{phone}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>
      <NewPerson
        show={showNewDialog}
        setShow={setShowNewDialog}
        countryData={counData}
      />
    </>
  );
};
