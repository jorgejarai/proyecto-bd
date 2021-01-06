import React, { useState } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { Button, Container, Form, Row, Col, Alert } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm } from 'formik';
import { useRegisterMutation } from '../generated/graphql';
// import Joi from "@hapi/joi";
import * as yup from 'yup';

export const userRegistrationSchema = yup.object({
  email: yup.string().email().max(254).required(),
  username: yup.string().min(5).max(16).required(),
  name: yup.string().min(5).max(64).required(),
  password: yup.string().min(3).max(64).required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required(),
});

export const Register: React.FC<RouteComponentProps> = ({ history }) => {
  const [register] = useRegisterMutation();
  const [generalError, setGeneralError] = useState('');

  return (
    <Container>
      <Row className="justify-content-md-center mt-3">
        <Col xs lg="5">
          <h1 className="text-center">Register</h1>
        </Col>
      </Row>
      <Row className="justify-content-md-center mt-3">
        <Col xs lg="5">
          <Formik
            initialValues={{
              email: '',
              username: '',
              name: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={userRegistrationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const { email, username, name, password } = values;

              setSubmitting(true);
              setGeneralError('');

              const response = await register({
                variables: {
                  email,
                  username,
                  name,
                  password,
                },
              });

              if (!response || !response.data) {
                setGeneralError('General error');
                return;
              }

              const { status, message } = response.data.register;

              if (status === 'error' && message) {
                setGeneralError(message);
              } else if (status === 'ok') {
                history.push('/login');
              }
            }}
          >
            {({ errors, isSubmitting }) => (
              <FormikForm noValidate>
                {generalError ? (
                  <Alert variant="danger">{generalError}</Alert>
                ) : null}
                <Form.Group as={Col} controlId="validationFormikEmail">
                  <Field
                    placeholder="Email"
                    name="email"
                    type="email"
                    as={Form.Control}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} controlId="validationFormikUsername">
                  <Field
                    placeholder="Username"
                    name="username"
                    as={Form.Control}
                    isInvalid={!!errors.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} controlId="validationFormikName">
                  <Field
                    placeholder="Name"
                    name="name"
                    isInvalid={!!errors.name}
                    as={Form.Control}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} controlId="validationFormikPassword">
                  <Field
                    placeholder="Password"
                    name="password"
                    type="password"
                    as={Form.Control}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group
                  as={Col}
                  controlId="validationFormikConfirmPassword"
                >
                  <Field
                    placeholder="Confirm your password"
                    name="confirmPassword"
                    type="password"
                    as={Form.Control}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col}>
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? 'Hang on...' : 'Register'}
                  </Button>
                </Form.Group>
              </FormikForm>
            )}
          </Formik>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <div className="mt-3 ">
            Already have an account? Just log in <Link to="/login">here</Link>!
          </div>
        </Col>
      </Row>
    </Container>
  );
};
