import React from 'react';
import loadingImage from '../assets/loading.svg';

export const Loading: React.FC = () => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ height: '100vh' }}
  >
    <img src={loadingImage} alt="Loading..." />
  </div>
);
