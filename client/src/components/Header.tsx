import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import {
  useMeQuery,
  useLogoutMutation,
  MeQuery,
  MeDocument,
} from '../generated/graphql';
import { setAccessToken } from '../accessToken';

export const Header: React.FC = () => {
  const { data, loading } = useMeQuery();
  const [logout, { client }] = useLogoutMutation();
  const history = useHistory();

  const loggedIn = !loading && data && data.me.user;
  const name = loggedIn ? data!.me!.user?.name : '';

  return (
    <Navbar bg="light" expand="lg">
      <LinkContainer to="/">
        <Navbar.Brand href="/">Página</Navbar.Brand>
      </LinkContainer>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        {loggedIn ? (
          <Nav className="mr-auto">
            <LinkContainer to="/persons">
              <Nav.Link>Persons</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/documents">
              <Nav.Link>Documents</Nav.Link>
            </LinkContainer>
          </Nav>
        ) : null}
        <Nav className="ml-auto">
          {!loggedIn ? (
            <LinkContainer to="/login">
              <Nav.Link>Login</Nav.Link>
            </LinkContainer>
          ) : (
            <>
              <Navbar.Text>
                Welcome, <Link to="/me">{name}</Link>
              </Navbar.Text>
              <Button
                className="ml-3"
                onClick={async () => {
                  try {
                    await logout({
                      update: (cache) => {
                        cache.writeQuery<MeQuery>({
                          query: MeDocument,
                          data: {
                            me: {
                              status: {
                                status: 'error',
                                message: 'Not logged in',
                              },
                            },
                          },
                        });
                      },
                    });
                  } catch {
                  } finally {
                    await client!.clearStore();
                    setAccessToken('');
                    history.push('/login');
                  }
                }}
              >
                Log out
              </Button>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
