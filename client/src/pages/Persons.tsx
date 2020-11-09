import React, { useState } from 'react';
import {
  usePersonsQuery,
  useAddPersonMutation,
  useAddAddressMutation,
  PersonsQuery,
  PersonsDocument,
} from '../generated/graphql';
import { Redirect } from 'react-router-dom';
import {
  Container,
  Form,
  Table,
  Col,
  Row,
  Button,
  Modal,
} from 'react-bootstrap';
import { PersonPlusFill } from 'react-bootstrap-icons';
import { Formik, Form as FormikForm, Field } from 'formik';

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
  const { data, loading, error } = usePersonsQuery();
  const [addAddress, { client }] = useAddAddressMutation();
  const [addPerson] = useAddPersonMutation();
  const [searchCriterion, setSearchCriterion] = useState<SearchCriterion>(
    searchCriteria[0]
  );
  const [search, setSearch] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.log(error);
    return <div>Error</div>;
  }

  if (!data || !data.persons) {
    return <Redirect to='/login' />;
  }

  return (
    <>
      <Container className='mt-3'>
        <Row>
          <Col className='d-flex'>
            <div>
              <h2 style={{ display: 'table-cell' }}>Persons</h2>
            </div>
            <Button className='ml-auto' onClick={() => setShowNewDialog(true)}>
              <PersonPlusFill size={24} />
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
        <Table striped bordered hover size='sm'>
          <thead>
            <tr>
              <th>RUT</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {data.persons.map((person) => {
              const { id, rut, name, email } = person;

              if (search.length !== 0) {
                const searchAttribute = person[
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
                  <td>{name}</td>
                  <td>{email}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>
      <Modal show={showNewDialog} onHide={() => setShowNewDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Person</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: '',
            rut: '',
            division: '',
            address: '',
            country: 152,
            email: '',
            phone: 0,
          }}
          onSubmit={async (values, { setSubmitting }) => {
            const {
              name,
              rut,
              division,
              address,
              country,
              email,
              phone,
            } = values;
            setSubmitting(true);

            const addressResponse = await addAddress({
              variables: {
                address,
                country,
                // postalCode
              },
            });

            if (!addressResponse || !addressResponse.data) {
              console.error('General error');
              return;
            }

            const addressId = addressResponse.data.addAddress;

            if (!addressId) {
              return null;
            }

            const personResponse = await addPerson({
              variables: {
                name,
                rut,
                division,
                email,
                phone,
                address: addressId,
              },
              update: (cache, { data }) => {
                if (!data) return null;

                const persons: any = cache.readQuery({
                  query: PersonsDocument,
                });
                const newPerson = data.addPerson;

                cache.writeQuery<PersonsQuery>({
                  query: PersonsDocument,
                  data: {
                    persons: [...persons.persons, newPerson],
                  },
                });

                client.resetStore();
              },
            });

            if (!personResponse || !personResponse.data) {
              console.error('General error');
              return;
            }

            setSubmitting(false);
            setShowNewDialog(false);
          }}
        >
          {({ isSubmitting }) => (
            <>
              <FormikForm>
                <Modal.Body>
                  <Form.Row>
                    <Form.Group as={Col} xs={8}>
                      <Field placeholder='Name' name='name' as={Form.Control} />
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Field placeholder='RUT' name='rut' as={Form.Control} />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col}>
                      <Field
                        placeholder='Division'
                        name='division'
                        as={Form.Control}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col} xs={7}>
                      <Field
                        placeholder='Address'
                        name='address'
                        as={Form.Control}
                      />
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Field
                        placeholder='Country'
                        name='country'
                        as={Form.Control}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col} xs={8}>
                      <Field
                        placeholder='Email'
                        name='email'
                        as={Form.Control}
                      />
                    </Form.Group>
                    <Form.Group as={Col}>
                      <Field
                        placeholder='Phone'
                        name='phone'
                        as={Form.Control}
                        type='number'
                      />
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
