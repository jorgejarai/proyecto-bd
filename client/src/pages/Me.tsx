import React, { useState } from 'react';
import { useMeQuery } from '../generated/graphql';
import { Redirect, useHistory } from 'react-router-dom';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field } from 'formik';
import { Loading } from '../components/Loading';
import { setAccessToken } from '../accessToken';
import { useChangePasswordMutation } from '../generated/graphql';

export const Me: React.FC = () => {
  const { data, loading, error } = useMeQuery();
  const [errorMessage, setErrorMessage] = useState('');
  const [updatePassword, { client }] = useChangePasswordMutation();
  const history = useHistory();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    console.log(error);
    return <div>Error</div>;
  }

  if (!data || !data.me) {
    return <Redirect to="/login" />;
  }

  return (
    <Container>
      <div className="mt-3">
        <div>
          {data.me.user?.name} ({data.me.user?.username})
        </div>
        <div>
          <a href={`mailto:${data.me.user?.email}`}>{data.me.user?.email}</a>
        </div>
      </div>
      <div>
        <h2>Change password</h2>
        <Formik
          initialValues={{ password: '' }}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);

            const changePassword = await updatePassword({
              variables: {
                user: data.me.user?.id!,
                newPassword: values.password,
              },
            });

            if (!changePassword || !changePassword.data) {
              setErrorMessage('Could not update password');

              setSubmitting(false);
              return
            }

            if (changePassword.data.changePassword.status === 'error' && changePassword.data.changePassword.message) {
              setErrorMessage(changePassword.data.changePassword.message);
            } else {
              setErrorMessage('');

              await client!.clearStore();
              setAccessToken('');
              history.push('/login');
            }

            setSubmitting(false);
          }}
        >
          {({ values, isSubmitting }) => (
            <FormikForm>
              <Form.Group>
                <Form.Label>New password</Form.Label>
                {errorMessage !== '' && <Alert variant="danger">{errorMessage}</Alert>}
                <Field name="password" type="password" as={Form.Control} />

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Hang on...' : 'Submit'}
                </Button>
              </Form.Group>
            </FormikForm>
          )}
        </Formik>
      </div>
    </Container>
  );
};
