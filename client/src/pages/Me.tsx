import React from 'react';
import { useMeQuery } from '../generated/graphql';
import { Redirect } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export const Me: React.FC = () => {
  const { data, loading, error } = useMeQuery();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.log(error);
    return <div>Error</div>;
  }

  console.log(data);
  if (!data || !data.me) {
    return <Redirect to='/login' />;
  }

  return (
    <Container>
      <div className='mt-3'>
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
