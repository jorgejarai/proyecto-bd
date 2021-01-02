import React, { useState } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { Button, Container, Form, Row, Col, Alert } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm } from 'formik';
import { setAccessToken } from '../accessToken';
import { MeQuery, MeDocument, useLoginMutation } from '../generated/graphql';

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [login, { client }] = useLoginMutation();
  const [generalError, setGeneralError] = useState('');

  return (
    <Container>
      <Row className="justify-content-md-center mt-3">
        <Col xs lg="5">
          <h1 className="text-center">Welcome!</h1>
        </Col>
      </Row>
      <Row className="justify-content-md-center mt-3">
        <Col xs lg="5">
          <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={async (values, { setSubmitting }) => {
              const { email, password } = values;
              setSubmitting(true);
              const response = await login({
                variables: {
                  email,
                  password,
                },
                update: (cache, { data }) => {
                  if (!data) return null;

                  cache.writeQuery<MeQuery>({
                    query: MeDocument,
                    data: {
                      me: {
                        status: {
                          status: 'ok',
                        },
                        user: data.login.user,
                      },
                    },
                  });
                  client.resetStore();
                },
              });

              if (!response || !response.data) {
                console.error('General error');
                return;
              }

              const {
                status: { status, message },
                accessToken,
              } = response.data.login;

              if (status === 'error' && message) {
                setGeneralError(message);
              } else if (status === 'ok') {
                setAccessToken(accessToken);
                history.push('/');
                window.location.reload();
              }
            }}
          >
            {({ isSubmitting }) => (
              <FormikForm>
                {generalError ? (
                  <Alert variant="danger">{generalError}</Alert>
                ) : null}
                <Form.Group>
                  <Field
                    placeholder="Email"
                    name="email"
                    type="email"
                    as={Form.Control}
                  />
                </Form.Group>
                <Form.Group>
                  <Field
                    placeholder="Password"
                    name="password"
                    type="password"
                    as={Form.Control}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  disabled={isSubmitting}
                  className="justify-content-center"
                  type="submit"
                >
                  {isSubmitting ? 'Hang on...' : 'Login'}
                </Button>
              </FormikForm>
            )}
          </Formik>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <div className="mt-3 ">
            Don't have an account? Just create one{' '}
            <Link to="/register">here</Link>!
          </div>
        </Col>
      </Row>
    </Container>
  );
};
