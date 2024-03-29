import React, { useState } from 'react';
import { useCountriesQuery, useMeQuery, usePersonsQuery } from '../generated/graphql';
import { Redirect } from 'react-router-dom';
import { Container, Form, Table, Col, Row, Button } from 'react-bootstrap';
import { PersonPlusFill } from 'react-bootstrap-icons';
import { NewPerson } from '../components/NewPerson';
import { Loading } from '../components/Loading';
import { PersonInfo } from '../components/PersonInfo';

type SearchCriterion = {
  criterion: 'rut' | 'name' | 'division' | 'email' | 'phone';
  displayName: string;
};

const searchCriteria: SearchCriterion[] = [
  {
    criterion: 'rut',
    displayName: 'RUT',
  },
  {
    criterion: 'name',
    displayName: 'Name',
  },
  {
    criterion: 'division',
    displayName: 'Division',
  },
  {
    criterion: 'email',
    displayName: 'Email',
  },
  {
    criterion: 'phone',
    displayName: 'Phone',
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
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useMeQuery();
  const [searchCriterion, setSearchCriterion] = useState<SearchCriterion>(
    searchCriteria[0]
  );
  const [search, setSearch] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const [currPerson, setCurrPerson] = useState(0);

  if (perLoading || counLoading || meLoading) {
    return <Loading />;
  }

  if (perError || counError || meError) {
    console.error(perError);
    return <div>Error</div>;
  }

  if (!perData || !perData.persons || !counData || !counData.countries || !meData || !meData.me) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <Container className="mt-3">
        <Row>
          <Col className="d-flex">
            <div>
              <h2 style={{ display: 'table-cell' }}>Persons</h2>
            </div>
            {meData.me.user!.isClerk && <Button className="ml-auto" onClick={() => setShowNewDialog(true)}>
              <PersonPlusFill size={24} />
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
              <Col xs={3}>
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
            {perData.persons.persons.length > 0 ? (
              [...perData.persons.persons].sort(({id: a, id: b}) => a - b).map((person) => {
                if (!person || !person || !person.address) return null;

                const { id, rut, name, division, phone, email } = person;
                const { address, country } = person.address;

                if (search.length !== 0) {
                  const searchAttribute = person[
                    searchCriterion.criterion
                  ]?.toLocaleString();

                  if (
                    searchAttribute &&
                    !searchAttribute
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase())
                  )
                    return null;
                }

                return (
                  <tr
                    key={id}
                    onDoubleClick={() => {
                      setCurrPerson(id);
                      setShowInfoDialog(true);
                    }}
                  >
                    <td>{rut}</td>
                    <td>{division ? `${name} - ${division}` : `${name}`}</td>
                    <td>{`${address}, ${country.name}`}</td>
                    <td>{email}</td>
                    <td>{phone}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <p className="text-center mt-3">
                    There are no persons registered
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
      <NewPerson
        show={showNewDialog}
        setShow={setShowNewDialog}
        countryData={counData}
      />
      <PersonInfo
        show={showInfoDialog}
        setShow={setShowInfoDialog}
        perId={currPerson}
      />
    </>
  );
};
