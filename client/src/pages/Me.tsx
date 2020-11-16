import React from "react";
import { useMeQuery } from "../generated/graphql";
import { Redirect } from "react-router-dom";
import { Container } from "react-bootstrap";
import Loader from "react-loader-spinner";

export const Me: React.FC = () => {
  const { data, loading, error } = useMeQuery();

  if (loading) {
    return <Loader type="Puff" color="#00bfff" height={100} width={100} />;
  }

  if (error) {
    console.log(error);
    return <div>Error</div>;
  }

  console.log(data);
  if (!data || !data.me) {
    return <Redirect to="/login" />;
  }

  return (
    <Container>
      <div className="mt-3">
        <div>
          {data.me.name} ({data.me.username})
        </div>
        <div>
          <a href={`mailto:${data.me.email}`}>{data.me.email}</a>
        </div>
      </div>
    </Container>
  );
};
