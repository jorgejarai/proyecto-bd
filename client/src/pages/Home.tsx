import React from "react";
import { Container, Table } from "react-bootstrap";
import { useUsersQuery } from "../generated/graphql";
import { Redirect } from "react-router-dom";
import Loader from "react-loader-spinner";

interface Props {}

export const Home: React.FC<Props> = () => {
  const { data, loading, error } = useUsersQuery({
    fetchPolicy: "network-only",
  });

  if (loading) {
    return <Loader type="Puff" color="#00bfff" height={100} width={100} />;
  }

  if (error && error.message === "Not authenticated") {
    return <Redirect to="/login" />;
  }

  if (error) {
    console.log(error);
    return <div>There was an error fetching the data</div>;
  }

  if (!data) {
    return <div>No data was received</div>;
  }

  return (
    <Container className="mt-3">
      <h2>Users</h2>
      <Table striped bordered hover size="sm" className="mt-3">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map(({ id, name, email }) => (
            <tr>
              <td>{id}</td>
              <td>{name}</td>
              <td>{email}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
