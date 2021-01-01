import React from 'react';
import { useMeQuery } from '../generated/graphql';
import { Redirect } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Loading } from '../components/Loading';

export const Me: React.FC = () => {
  const { data, loading, error } = useMeQuery();

  if (loading) {
    return <Loading />;
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
          {data.me.user?.name} ({data.me.user?.username})
        </div>
        <div>
          <a href={`mailto:${data.me.user?.email}`}>{data.me.user?.email}</a>
        </div>
      </div>
    </Container>
  );
};
